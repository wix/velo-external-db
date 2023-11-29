import { validateSystemFields, parseTableData, AllSchemaOperations, EmptyCapabilities, errors } from '@wix-velo/velo-external-db-commons'
import SchemaColumnTranslator from './sql_schema_translator'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'
import { recordSetToObj, escapeId, patchFieldName, unpatchFieldName, escapeFieldId } from './spanner_utils'
import { Database as SpannerDb } from '@google-cloud/spanner'
import { CollectionCapabilities, Encryption, InputField, ISchemaProvider, PagingMode, SchemaOperations, Table } from '@wix-velo/velo-external-db-types'
import { CollectionOperations, ColumnsCapabilities, FieldTypes, ReadOnlyOperations, ReadWriteOperations } from './spanner_capabilities'
const { CollectionDoesNotExists, CollectionAlreadyExists } = errors

export default class SchemaProvider implements ISchemaProvider {
    database: SpannerDb
    sqlSchemaTranslator: SchemaColumnTranslator

    constructor(database: any) {
        this.database = database
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list(): Promise<Table[]> {
        const query = {
            sql: 'SELECT table_name, COLUMN_NAME as field, SPANNER_TYPE as type FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema',
            params: {
                tableSchema: '',
                tableCatalog: '',
            },
        }

        const [rows] = await this.database.run(query)
        const res = recordSetToObj(rows) as { table_name: string, field: string, type: string }[]

        const tables = parseTableData(res)

        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.appendAdditionalFieldDetails.bind(this) ),
                         capabilities: this.collectionCapabilities(rs.map(r => r.field))
                     }))
    }

    async listHeaders(): Promise<string[]> {
        const query = {
            sql: 'SELECT table_name FROM information_schema.tables WHERE table_catalog = @tableCatalog and table_schema = @tableSchema',
            params: {
                tableSchema: '',
                tableCatalog: '',
            },
        }

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map(rs => rs['table_name'])
    }

    supportedOperations(): SchemaOperations[] {
        return AllSchemaOperations
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        const dbColumnsSql = columns.map( this.fixColumn.bind(this) )
                                                                  .map( (c: InputField) => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                  .join(', ')

        const primaryKeySql = columns.filter(f => f.isPrimary).map(f => escapeFieldId(f.name)).join(', ')

        // Remind: Spanner doesnt allow to create fields with _ in the beginning, so all the system fields are patched with x in the beginning
        await this.updateSchema(`CREATE TABLE ${escapeId(collectionName)} (${dbColumnsSql}) PRIMARY KEY (${primaryKeySql})`, collectionName, CollectionAlreadyExists)
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)

        await this.updateSchema(`ALTER TABLE ${escapeId(collectionName)} ADD COLUMN ${this.sqlSchemaTranslator.columnToDbColumnSql(column)}`, collectionName)
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await validateSystemFields(columnName)

        await this.updateSchema(`ALTER TABLE ${escapeId(collectionName)} DROP COLUMN ${escapeId(columnName)}`, collectionName)
    }

    async describeCollection(collectionName: string): Promise<Table> {
        const query = {
            sql: 'SELECT table_name, COLUMN_NAME as field, SPANNER_TYPE as type FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema and table_name = @tableName',
            params: {
                tableSchema: '',
                tableCatalog: '',
                tableName: collectionName,
            },
        }

        const [rows] = await this.database.run(query)
        const res = recordSetToObj(rows)

        if (res.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists', collectionName)
        }

        return {
            id: collectionName,
            fields: res.map( this.appendAdditionalFieldDetails.bind(this) ),
            capabilities: this.collectionCapabilities(res.map(f => f.field))
        }
    }

    async drop(collectionName: string): Promise<void> {
        await this.updateSchema(`DROP TABLE ${escapeId(collectionName)}`, collectionName)
    }

    async changeColumnType(collectionName: string, _column: InputField): Promise<void> {
        throw new errors.UnsupportedSchemaOperation('changeColumnType is not supported', collectionName, 'changeColumnType')
    }

    async updateSchema(sql: string, collectionName: string, catching: any = undefined ) {
        try {
            const [operation] = await this.database.updateSchema([sql])

            await operation.promise()
        } catch (err) {
            const e = notThrowingTranslateErrorCodes(err, collectionName)
            if (!catching || (catching && !(e instanceof catching))) {
                throw e
            }
        }
    }

    private fixColumn(c: InputField) {
        return { ...c, name: patchFieldName(c.name) }
    }

    private appendAdditionalFieldDetails(row: { field: string, type: string }) {
        const type = this.sqlSchemaTranslator.translateType(row.type).type as keyof typeof ColumnsCapabilities
        return {
            field: unpatchFieldName(row.field),
            ...this.sqlSchemaTranslator.translateType(row.type),
            capabilities: ColumnsCapabilities[type] ?? EmptyCapabilities
        }
    }

    private collectionCapabilities(fieldNames: string[]): CollectionCapabilities {
        return {
            dataOperations: fieldNames.map(unpatchFieldName).includes('_id') ? ReadWriteOperations : ReadOnlyOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
            referenceCapabilities: { supportedNamespaces: [] },
            indexing: [],
            encryption: Encryption.notSupported,
            pagingMode: PagingMode.offset
        }
    }

}
