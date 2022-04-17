const { translateErrorCodes, notThrowingTranslateErrorCodes } = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { escapeId, escapeTable } = require('./mssql_utils')
const { SystemFields, validateSystemFields, parseTableData } = require('velo-external-db-commons')
const { supportedOperations } = require('./supported_operations')
const { CollectionDoesNotExists, CollectionAlreadyExists } = require('velo-external-db-commons').errors
class SchemaProvider {
    constructor(pool) {
        this.sql = pool

        this.dbName = pool.config.database

        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        const rs = await this.sql.request()
                                 .input('db', this.dbName)
                                 .query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = @db')
        const tables = parseTableData( rs.recordset )
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.translateDbTypes.bind(this) )
                     }))
    }

    async listHeaders() {
        const rs = await this.sql.request()
                                 .input('db', this.dbName)
                                 .query('SELECT TABLE_NAME as table_name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = @db')
        return rs.recordset.map( rs => rs.table_name )
    }

    supportedOperations() {
        return supportedOperations
    }

    async create(collectionName, columns) {
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeId(f.name)).join(', ')
        await this.sql.query(`CREATE TABLE ${escapeTable(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                                [...(columns || []).map(c => c.name)])
                      .catch( err => {
                          const e = notThrowingTranslateErrorCodes(err)
                          if (!(e instanceof CollectionAlreadyExists)) {
                              throw e
                          } } )
    }

    async drop(collectionName) {
        await this.sql.query(`DROP TABLE IF EXISTS ${escapeTable(collectionName)}`)
            .catch( translateErrorCodes )
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)
        await this.sql.query(`ALTER TABLE ${escapeTable(collectionName)} ADD ${escapeId(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                       .catch( translateErrorCodes )
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)
        return await this.sql.query(`ALTER TABLE ${escapeTable(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
                              .catch( translateErrorCodes )
    }

    async describeCollection(collectionName) {
        const rs = await this.sql.request()
                                 .input('db', this.dbName)
                                 .input('tableName', collectionName)
                                 .query('SELECT TABLE_NAME as table_name, COLUMN_NAME as field, DATA_TYPE as type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_CATALOG = @db AND TABLE_NAME = @tableName')

        if (rs.recordset.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return rs.recordset.map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }
}

module.exports = SchemaProvider
