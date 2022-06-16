import { promisify } from 'util'
import { translateErrorCodes } from './sql_exception_translator'
import SchemaColumnTranslator, { IMySqlSchemaColumnTranslator } from './sql_schema_translator'
import { escapeId, escapeTable } from './mysql_utils'
import { SystemFields, validateSystemFields, parseTableData, AllSchemaOperations } from '@wix-velo/velo-external-db-commons'
import { Pool as MySqlPool } from 'mysql'
import { MySqlQuery } from './types'
import { ResponseField, Table } from '@wix-velo/velo-external-db-types'

class SchemaProvider {
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
        const tables = parseTableData( data )
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.translateDbTypes.bind(this) )
                     } ))
    }

    async listHeaders() {
        const currentDb = this.pool.config.connectionConfig.database
        const data = await this.query('SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME', currentDb)
        return data.map( (rs: { table_name: any }) => rs.table_name )
    }

    supportedOperations() {
        return AllSchemaOperations
    }

    async create(collectionName: string, columns: any) {
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ')

        await this.query(`CREATE TABLE IF NOT EXISTS ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                         [...(columns || []).map((c: { name: any }) => c.name)])
                  .catch( translateErrorCodes )
    }

    async drop(collectionName: string) {
        await this.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
                  .catch( translateErrorCodes )
    }

    async addColumn(collectionName: string, column: { name: string }) {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName: string, columnName: string) {
        await validateSystemFields(columnName)
        return await this.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                         .catch( translateErrorCodes )
    }

    async describeCollection(collectionName: string) {
        const res = await this.query(`DESCRIBE ${escapeTable(collectionName)}`)
                              .catch( translateErrorCodes )
        return res.map((r: { Field: string; Type: string }) => ({ field: r.Field, type: r.Type }))
                  .map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row: ResponseField) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }
}

module.exports = SchemaProvider
