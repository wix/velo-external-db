const { translateErrorCodes } = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { escapeIdentifier } = require('./postgres_utils')
const { CollectionDoesNotExists } = require('velo-external-db-commons').errors
const { SystemFields, validateSystemFields, parseTableData, SchemaOperations } = require('velo-external-db-commons')

const { LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION } = SchemaOperations
const schemaSupportedOperations =  [LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION]

class SchemaProvider {
    constructor(pool) {
        this.pool = pool

        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        const data = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type FROM information_schema.columns WHERE table_schema = $1 ORDER BY table_name', ['public'])

        const tables = parseTableData(data.rows)
        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.translateDbTypes.bind(this) )
                     }))
    }

    async listHeaders() {
        const data = await this.pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name', ['public'])
        return data.rows.map(rs => rs.table_name )
    }

    supportedOperations() {
        return schemaSupportedOperations
    }

    async create(collectionName, _columns) {
        const columns = _columns || []
        const dbColumnsSql = [...SystemFields, ...columns].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                               .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeIdentifier(f.name)).join(', ')

        await this.pool.query(`CREATE TABLE IF NOT EXISTS ${escapeIdentifier(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`)
                  .catch( translateErrorCodes )
    }

    async drop(collectionName) {
        await this.pool.query(`DROP TABLE IF EXISTS ${escapeIdentifier(collectionName)}`)
                  .catch( translateErrorCodes )
    }


    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)

        await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} ADD ${escapeIdentifier(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)

        return await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} DROP COLUMN ${escapeIdentifier(columnName)}`)
                         .catch( translateErrorCodes )
    }

    async describeCollection(collectionName) {
        const res = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type, character_maximum_length FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY table_name', ['public', collectionName])
                              .catch( translateErrorCodes )
        if (res.rows.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }
        return res.rows.map( this.translateDbTypes.bind(this) )
    }


    translateDbTypes(row) {
        return {
            field: row.field,
            type: this.sqlSchemaTranslator.translateType(row.type)
        }
    }
}

module.exports = { SchemaProvider, schemaSupportedOperations }
