const { CollectionDoesNotExists } = require('velo-external-db-commons').errors
const { translateErrorCodes } = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { SystemFields, validateSystemFields, asWixSchema, parseTableData } = require('velo-external-db-commons')

const escapeIdentifier = i => i
class SchemaProvider {
    constructor(pool) {
        this.pool = pool
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        try{
            const res = await this.pool.query('SELECT table_name, column_name AS field, data_type as type, FROM INFORMATION_SCHEMA.COLUMNS')
            const tables = parseTableData(res[0])
            return Object.entries(tables)
                        .map(([collectionName, rs]) => asWixSchema(rs.map( this.translateDbTypes.bind(this) ), collectionName))
        } catch(e) {
            console.log(e)
        }

    }

    async create(collectionName, _columns) {
        try{
            const columns = _columns || []
            const dbColumnsSql = [...SystemFields, ...columns].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c))
            await this.pool.createTable(collectionName, { schema: dbColumnsSql })
                      .catch(translateErrorCodes)         
        } catch(e) {
            console.log(e)
        }
    }

    async drop(collectionName) {
        try {
            await this.pool.table(collectionName).delete()
                      .catch(translateErrorCodes)  
        } catch(e) {
            og.error(e)
        }
    }


    async addColumn(collectionName, column) {
        try {
            await validateSystemFields(column.name)
            await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} ADD COLUMN ${escapeIdentifier(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
            .catch(translateErrorCodes)

        } catch(e) {
            console.log(e)
        }        
    }

    async removeColumn(collectionName, columnName) {
        try {
            await validateSystemFields(columnName)
            await this.pool.query(`CREATE OR REPLACE TABLE ${escapeIdentifier(collectionName)} AS SELECT * EXCEPT (${escapeIdentifier(columnName)}) FROM  ${escapeIdentifier(collectionName)}`)
            .catch(translateErrorCodes)
        } catch(e) {
            console.log(e)
        }


        
    }

    async describeCollection(collectionName) {
        try{
            const res = await this.pool.query(`SELECT table_name, column_name AS field, data_type as type, FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name="${escapeIdentifier(collectionName)}"`)
            if (res[0].length === 0) {
                throw new CollectionDoesNotExists('Collection does not exists')
            }
            return asWixSchema(res[0].map( this.translateDbTypes.bind(this) ), collectionName)
        } catch(e) {
            console.log(e)
        }

    }


    translateDbTypes(row) {
        row.type = this.sqlSchemaTranslator.translateType(row.type)
        return row
    }

}

module.exports = SchemaProvider
