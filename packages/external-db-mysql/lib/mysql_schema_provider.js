const { promisify } = require('util')
const { translateErrorCodes } = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { escapeId } = require('mysql')
const { SystemFields, validateSystemFields, asWixSchema, parseTableData } = require('velo-external-db-commons')

class SchemaProvider {
    constructor(pool) {
        this.pool = pool

        this.systemFields = SystemFields
        this.sqlSchemaTranslator = new SchemaColumnTranslator()

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list() {
        const currentDb = this.pool.config.connectionConfig.database
        const data = await this.query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM information_schema.columns WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME, ORDINAL_POSITION', currentDb)
        const tables = parseTableData( data )
        return Object.entries(tables)
                     .map(([collectionName, rs]) => asWixSchema(rs.map( this.translateDbTypes.bind(this) ), collectionName))
    }


    async create(collectionName, columns) {
        const dbColumnsSql = [...this.systemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = this.systemFields.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ')

        await this.query(`CREATE TABLE IF NOT EXISTS ${escapeId(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                         [...(columns || []).map(c => c.name)])
                  .catch( translateErrorCodes )
    }

    async drop(collectionName) {
        await this.query(`DROP TABLE IF EXISTS ${escapeId(collectionName)}`)
                  .catch( translateErrorCodes )
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        await this.query(`ALTER TABLE ${escapeId(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)
        return await this.query(`ALTER TABLE ${escapeId(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                         .catch( translateErrorCodes )
    }

    async describeCollection(collectionName) {
        const res = await this.query(`DESCRIBE ${escapeId(collectionName)}`)
                              .catch( translateErrorCodes )
        const rows = res.map(r => ({field: r.Field, type: r.Type}))
                        .map( this.translateDbTypes.bind(this) )
        return asWixSchema(rows, collectionName)
    }

    translateDbTypes(row) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }
}

module.exports = SchemaProvider
