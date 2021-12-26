const { promisify } = require('util')
const { translateErrorCodes } = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { escapeId, escapeTable } = require('./mysql_utils')
const { SystemFields, validateSystemFields, parseTableData, SchemaOperations } = require('velo-external-db-commons')

const { LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION } = SchemaOperations
const schemaSupportedOperations =  [LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION]

class SchemaProvider {
    constructor(pool) {
        this.pool = pool

        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list() {
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
        return data.map( rs => rs.table_name )
    }

    supportedOperations() {
        return schemaSupportedOperations
    }

    async create(collectionName, columns) {
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ')

        await this.query(`CREATE TABLE IF NOT EXISTS ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                         [...(columns || []).map(c => c.name)])
                  .catch( translateErrorCodes )
    }

    async drop(collectionName) {
        await this.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
                  .catch( translateErrorCodes )
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)
        return await this.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                         .catch( translateErrorCodes )
    }

    async describeCollection(collectionName) {
        const res = await this.query(`DESCRIBE ${escapeTable(collectionName)}`)
                              .catch( translateErrorCodes )
        return res.map(r => ({ field: r.Field, type: r.Type }))
                  .map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }
}

module.exports = { SchemaProvider, schemaSupportedOperations }
