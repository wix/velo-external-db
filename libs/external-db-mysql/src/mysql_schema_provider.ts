import { promisify } from 'util'
import { translateErrorCodes } from './sql_exception_translator'
import SchemaColumnTranslator, { IMySqlSchemaColumnTranslator } from './sql_schema_translator'
import { escapeId, escapeTable, columnCapabilitiesFor } from './mysql_utils'
import { SystemFields, validateSystemFields, parseTableData, AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { Pool as MySqlPool } from 'mysql'
import { MySqlQuery } from './types'
import { InputField, ISchemaProvider, ResponseField, SchemaOperations, Table, ColumnCapabilities, DbCapabilities } from '@wix-velo/velo-external-db-types'


export default class SchemaProvider implements ISchemaProvider {
    pool: MySqlPool
    sqlSchemaTranslator: IMySqlSchemaColumnTranslator
    query: MySqlQuery
    constructor(pool: any) {
        this.pool = pool

        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list(): Promise<Table[]> {
        const currentDb = this.pool.config.connectionConfig.database
        const data = await this.query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM information_schema.columns WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION', currentDb)
        const tables: {[x:string]: {table_name: string, field: string, type: string}[]} = parseTableData( data )
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.translateDbTypes.bind(this) )
                     } ))
    }

    async listHeaders(): Promise<string[]> {
        const currentDb = this.pool.config.connectionConfig.database
        const data = await this.query('SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME', currentDb)
        return data.map( (rs: { table_name: any }) => rs.table_name )
    }

    supportedOperations(): SchemaOperations[] {
        return AllSchemaOperations
    }

    async create(collectionName: string, columns: InputField[]): Promise<void> {
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ')

        await this.query(`CREATE TABLE IF NOT EXISTS ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                         [...(columns || []).map((c: { name: any }) => c.name)])
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async drop(collectionName: string): Promise<void> {
        await this.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async addColumn(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( err => translateErrorCodes(err, collectionName) )
    }

    async changeColumnType(collectionName: string, column: InputField): Promise<void> {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} MODIFY ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName: string, columnName: string): Promise<void> {
        await validateSystemFields(columnName)
        return await this.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                         .catch( err => translateErrorCodes(err, collectionName) )
    }

    async describeCollection(collectionName: string): Promise<ResponseField[]> {
        const res = await this.query(`DESCRIBE ${escapeTable(collectionName)}`)
                              .catch( err => translateErrorCodes(err, collectionName) )
        return res.map((r: { Field: string; Type: string }) => ({ field: r.Field, type: r.Type }))
                  .map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row: ResponseField): ResponseField {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }

    columnCapabilitiesFor(columnType: string): ColumnCapabilities {
        return columnCapabilitiesFor(columnType)
    }

    capabilities(): DbCapabilities {
        return {
            dataOperations: [],
            fieldTypes: [],
            collectionOperations: [],
        }
    }
}
