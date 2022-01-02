const { CollectionDoesNotExists } = require('velo-external-db-commons').errors
const { translateErrorCodes } = require('./sql_exception_translator')
const { schemaSupportedOperations, escapeIdentifier } = require('./bigquery_utils')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { SystemFields, validateSystemFields, parseTableData } = require('velo-external-db-commons')

class SchemaProvider {
    constructor(pool, { projectId, databaseId }) {
        this.projectId = projectId
        this.databaseId = databaseId
        this.pool = pool
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        const res = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM ${this.projectId}.${this.databaseId}.INFORMATION_SCHEMA.COLUMNS`)
        const tables = parseTableData(res[0])
        return Object.entries(tables)
                        .map(([collectionName, rs]) => ({
                            id: collectionName,
                            fields: rs.map( this.translateDbTypes.bind(this) )
                        }))
    }

    async listHeaders() {
        const data = await this.pool.query(`SELECT table_name FROM ${this.projectId}.${this.databaseId}.INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME`)
        return data[0].map(rs => rs.table_name )
    }

    supportedOperations() {
        return schemaSupportedOperations
    }

    async create(collectionName, _columns) {
        const columns = _columns || []
        const dbColumnsSql = [...SystemFields, ...columns].map(c => this.sqlSchemaTranslator.columnToDbColumnSql(c))
        await this.pool.createTable(collectionName, { schema: dbColumnsSql })
                       .catch(translateErrorCodes)
    }

    async drop(collectionName) {
        await this.pool.table(collectionName).delete()
                       .catch(translateErrorCodes)
    }


    async addColumn(collectionName, column) {   
        await validateSystemFields(column.name)
        const fullCollectionName = `${this.projectId}.${this.databaseId}.${collectionName}`
        try{
            await this.pool.query(`ALTER TABLE ${escapeIdentifier(fullCollectionName)} ADD COLUMN ${escapeIdentifier(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
        } catch (err) {
            if (err.message.includes('was not found')) 
                throw new CollectionDoesNotExists('Collection does not exists')
            else 
                translateErrorCodes(err)
        }
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)
        const fullCollectionName = `${this.projectId}.${this.databaseId}.${collectionName}`
        await this.pool.query(`CREATE OR REPLACE TABLE ${escapeIdentifier(fullCollectionName)} AS SELECT * EXCEPT (${escapeIdentifier(columnName)}) FROM ${escapeIdentifier(fullCollectionName)}`)
            .catch(translateErrorCodes)
    }

    async describeCollection(collectionName) {
        const res = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM ${this.projectId}.${this.databaseId}.INFORMATION_SCHEMA.COLUMNS WHERE table_name='${collectionName}'`)
                                   .catch(translateErrorCodes)

        if (res[0].length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return res[0].map( this.translateDbTypes.bind(this) )
    }

    translateDbTypes(row) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }

}

module.exports = SchemaProvider
