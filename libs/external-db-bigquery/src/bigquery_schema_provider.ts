import { Dataset } from '@google-cloud/bigquery'
import { SystemFields, validateSystemFields, parseTableData, SchemaOperations, errors } from '@wix-velo/velo-external-db-commons'
import { InputField, ISchemaProvider, ResponseField } from '@wix-velo/velo-external-db-types'
import { translateErrorCodes, createCollectionTranslateErrorCodes, addColumnTranslateErrorCodes, removeColumnTranslateErrorCodes } from './sql_exception_translator'
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

    async list() {
        const res = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM ${escapeIdentifier(`${this.projectId}.${this.databaseId}`)}.INFORMATION_SCHEMA.COLUMNS`)
        const tables = parseTableData(res[0])
        return Object.entries(tables)
                        .map(([collectionName, rs]: [any, any]) => ({
                            id: collectionName,
                            fields: rs.map( this.translateDbTypes.bind(this) )
                        }))
    }

    async listHeaders() {
        const data = await this.pool.query(`SELECT table_name FROM ${escapeIdentifier(`${this.projectId}.${this.databaseId}`)}.INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME`)
        return data[0].map((rs: { table_name: any }) => rs.table_name )
    }

    supportedOperations() {
        const { List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate } = SchemaOperations

        return [ List, ListHeaders, Create, Drop, AddColumn, RemoveColumn, Describe, FindWithSort, Aggregate, BulkDelete, Truncate ]
    }

    async create(collectionName: string, _columns: never[]) {
        const columns = _columns || []
        const dbColumnsSql = [...SystemFields, ...columns].map(c => this.sqlSchemaTranslator.columnToDbColumnSql(c, { escapeId: false, precision: false }))
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

    async describeCollection(collectionName: string): Promise<ResponseField[]> {        
        const res = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM ${escapeIdentifier(`${this.projectId}.${this.databaseId}`)}.INFORMATION_SCHEMA.COLUMNS WHERE table_name='${collectionName}'`)
                                   .catch(translateErrorCodes)

        if (res[0].length === 0) {
            throw new errors.CollectionDoesNotExists('Collection does not exists')
        }

        return res[0].map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row: ResponseField) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }

}