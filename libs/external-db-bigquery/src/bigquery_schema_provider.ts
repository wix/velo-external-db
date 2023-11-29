import { Dataset } from '@google-cloud/bigquery'
import { validateSystemFields, parseTableData, errors, EmptyCapabilities } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, ResponseField, Table, SchemaOperations, CollectionCapabilities, Encryption, PagingMode } from '@wix-velo/velo-external-db-types'
import { translateErrorCodes, createCollectionTranslateErrorCodes, addColumnTranslateErrorCodes, removeColumnTranslateErrorCodes } from './sql_exception_translator'
import { CollectionOperations, FieldTypes, ReadOnlyOperations, ReadWriteOperations, ColumnsCapabilities } from './bigquery_capabilities'
import { escapeIdentifier } from './bigquery_utils'
import SchemaColumnTranslator from './sql_schema_translator'
import { BigQueryConfig } from './types'

export default class SchemaProvider implements ISchemaProvider {
    projectId: string
    databaseId: string
    pool: Dataset
    sqlSchemaTranslator: SchemaColumnTranslator

    constructor(pool: Dataset, { projectId, databaseId }: BigQueryConfig) {
        this.projectId = projectId
        this.databaseId = databaseId
        this.pool = pool
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list(): Promise<Table[]> {
        const res = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM ${escapeIdentifier(`${this.projectId}.${this.databaseId}`)}.INFORMATION_SCHEMA.COLUMNS`)
        const tables = parseTableData(res[0])
        return Object.entries(tables)
                        .map(([collectionName, rs]) => ({
                            id: collectionName,
                            fields: rs.map(this.appendAdditionalRowDetails.bind(this)),
                            capabilities: this.collectionCapabilities(rs.map(r => r.field))
                        }))
    }

    async listHeaders() {
        const data = await this.pool.query(`SELECT table_name FROM ${escapeIdentifier(`${this.projectId}.${this.databaseId}`)}.INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME`)
        return data[0].map((rs: { table_name: string }) => rs.table_name )
    }

    supportedOperations() {
        const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate } = SchemaOperations

        return [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate ]
    }

    async create(collectionName: string, columns: InputField[]) {
        const dbColumnsSql = columns.map(c => this.sqlSchemaTranslator.columnToDbColumnSql(c, { escapeId: false, precision: false }))
        await this.pool.createTable(collectionName, { schema: dbColumnsSql })
                       .catch(createCollectionTranslateErrorCodes)
    }

    async drop(collectionName: string) {
        await this.pool.table(collectionName).delete()
                       .catch(translateErrorCodes)
    }


    async addColumn(collectionName: string, column: InputField) {   
        await validateSystemFields(column.name)
        const fullCollectionName = `${this.projectId}.${this.databaseId}.${collectionName}`
        await this.pool.query(`ALTER TABLE ${escapeIdentifier(fullCollectionName)} ADD COLUMN ${escapeIdentifier(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                       .catch(addColumnTranslateErrorCodes)
    }

    async removeColumn(collectionName: string, columnName: string) {
        await validateSystemFields(columnName)
        const fullCollectionName = `${this.projectId}.${this.databaseId}.${collectionName}`
        await this.pool.query(`CREATE OR REPLACE TABLE ${escapeIdentifier(fullCollectionName)} AS SELECT * EXCEPT (${escapeIdentifier(columnName)}) FROM ${escapeIdentifier(fullCollectionName)}`)
                       .catch(removeColumnTranslateErrorCodes)
    }

    async changeColumnType(_collectionName: string, _column: InputField): Promise<void> {
        throw new Error('Change column type is not supported')
    }

    async describeCollection(collectionName: string): Promise<Table> {        
        const [res] = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM ${escapeIdentifier(`${this.projectId}.${this.databaseId}`)}.INFORMATION_SCHEMA.COLUMNS WHERE table_name='${collectionName}'`)
                                   .catch(translateErrorCodes)
        
        if (res.length === 0) {
            throw new errors.CollectionDoesNotExists('Collection does not exists', collectionName)
        }

        return {
            id: collectionName,
            fields: res.map(this.appendAdditionalRowDetails.bind(this)),
            capabilities: this.collectionCapabilities(res.map(r => r.field))
        }

    }
    private appendAdditionalRowDetails(row: {field: string, type: string}) : ResponseField {
        const type = this.sqlSchemaTranslator.translateType(row.type)
        return {
            field: row.field,
            type,
            capabilities: ColumnsCapabilities[type] ?? EmptyCapabilities
        }
    }
    
    private collectionCapabilities(fieldNames: string[]): CollectionCapabilities {
        return {
            dataOperations: fieldNames.includes('_id') ? ReadWriteOperations : ReadOnlyOperations,
            fieldTypes: FieldTypes,
            collectionOperations: CollectionOperations,
            referenceCapabilities: { supportedNamespaces: [] },
            indexing: [],
            encryption: Encryption.notSupported,
            pagingMode: PagingMode.offset
        }
    }

}
