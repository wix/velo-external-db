import { SystemFields, validateSystemFields, parseTableData, AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import SchemaColumnTranslator from './sql_schema_translator'
import { notThrowingTranslateErrorCodes } from './sql_exception_translator'
import { recordSetToObj, escapeId, patchFieldName, unpatchFieldName, escapeFieldId } from './spanner_utils'
import { Database as SpannerDb } from '@google-cloud/spanner'
import { InputField, ISchemaProvider, ResponseField, SchemaOperations, Table, TableHeader } from '@wix-velo/velo-external-db-types'
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
            sql: 'SELECT table_name, COLUMN_NAME, SPANNER_TYPE FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema',
            params: {
                tableSchema: '',
                tableCatalog: '',
            },
        }

        const [rows] = await this.database.run(query)
        const res = recordSetToObj(rows)

        const tables: {[x:string]: {table_name: string, field: string, type: string}[]} = parseTableData(res)

        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.reformatFields.bind(this) )
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
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( this.fixColumn.bind(this) )
                                                                  .map( (c: InputField) => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                  .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeFieldId(f.name)).join(', ')

        await this.updateSchema(`CREATE TABLE ${escapeId(collectionName)} (${dbColumnsSql}) PRIMARY KEY (${primaryKeySql})`, CollectionAlreadyExists)
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)

        await this.updateSchema(`ALTER TABLE ${escapeId(collectionName)} ADD COLUMN ${this.sqlSchemaTranslator.columnToDbColumnSql(column)}`)
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await validateSystemFields(columnName)

        await this.updateSchema(`ALTER TABLE ${escapeId(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
    }

    async describeCollection(collectionName: string): Promise<ResponseField[]> {
        const query = {
            sql: 'SELECT table_name, COLUMN_NAME, SPANNER_TYPE FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema and table_name = @tableName',
            params: {
                tableSchema: '',
                tableCatalog: '',
                tableName: collectionName,
            },
        }

        const [rows] = await this.database.run(query)
        const res = recordSetToObj(rows)

        if (res.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return res.map( this.reformatFields.bind(this) )
    }

    async drop(collectionName: string): Promise<void> {
        await this.updateSchema(`DROP TABLE ${escapeId(collectionName)}`)
    }


    async updateSchema(sql: string, catching: any = undefined) {
        try {
            const [operation] = await this.database.updateSchema([sql])

            await operation.promise()
        } catch (err) {
            const e = notThrowingTranslateErrorCodes(err)
            if (!catching || (catching && !(e instanceof catching))) {
                throw e
            }
        }
    }

    fixColumn(c: InputField) {
        return { ...c, name: patchFieldName(c.name) }
    }

    reformatFields(r: { [x: string]: string }) {
        const { type, subtype } = this.sqlSchemaTranslator.translateType(r['SPANNER_TYPE'])
        return {
            field: unpatchFieldName(r['COLUMN_NAME']),
            type,
            subtype
        }
    }

}
