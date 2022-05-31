const { SystemFields, validateSystemFields, parseTableData, AllSchemaOperations } = require('@wix-velo/velo-external-db-commons')
const { CollectionDoesNotExists, CollectionAlreadyExists } = require('@wix-velo/velo-external-db-commons').errors
const SchemaColumnTranslator = require('./sql_schema_translator')
const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')
const { recordSetToObj, escapeId, patchFieldName, unpatchFieldName, escapeFieldId } = require('./spanner_utils')

class SchemaProvider {
    constructor(database) {
        this.database = database

        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        const query = {
            sql: 'SELECT table_name, COLUMN_NAME, SPANNER_TYPE FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema',
            params: {
                tableSchema: '',
                tableCatalog: '',
            },
        }

        const [rows] = await this.database.run(query)
        const res = recordSetToObj(rows)

        const tables = parseTableData(res)

        return Object.entries(tables)
                     .map(([collectionName, rs]) => ({
                         id: collectionName,
                         fields: rs.map( this.reformatFields.bind(this) )
                     }))
    }

    async listHeaders() {
        const query = {
            sql: 'SELECT table_name FROM information_schema.tables WHERE table_catalog = @tableCatalog and table_schema = @tableSchema',
            params: {
                tableSchema: '',
                tableCatalog: '',
            },
        }

        const [rows] = await this.database.run(query)
        return recordSetToObj(rows).map(rs => rs['table_name'])
    }

    supportedOperations() {
        return AllSchemaOperations
    }

    async create(collectionName, columns) {
        const dbColumnsSql = [...SystemFields, ...(columns || [])].map( this.fixColumn.bind(this) )
                                                                  .map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                  .join(', ')
        const primaryKeySql = SystemFields.filter(f => f.isPrimary).map(f => escapeFieldId(f.name)).join(', ')

        await this.updateSchema(`CREATE TABLE ${escapeId(collectionName)} (${dbColumnsSql}) PRIMARY KEY (${primaryKeySql})`, CollectionAlreadyExists)
    }

    async addColumn(collectionName, column) {
        await validateSystemFields(column.name)

        await this.updateSchema(`ALTER TABLE ${escapeId(collectionName)} ADD COLUMN ${this.sqlSchemaTranslator.columnToDbColumnSql(column)}`)
    }

    async removeColumn(collectionName, columnName) {
        await validateSystemFields(columnName)

        await this.updateSchema(`ALTER TABLE ${escapeId(collectionName)} DROP COLUMN ${escapeId(columnName)}`)
    }

    async describeCollection(collectionName) {
        const query = {
            sql: 'SELECT table_name, COLUMN_NAME, SPANNER_TYPE FROM information_schema.columns WHERE table_catalog = @tableCatalog and table_schema = @tableSchema and table_name = @tableName',
            params: {
                tableSchema: '',
                tableCatalog: '',
                tableName: collectionName,
            },
        }

        const [rows] = await this.database.run(query)
        const res = recordSetToObj(rows)

        if (res.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return res.map( this.reformatFields.bind(this) )
    }

    async drop(collectionName) {
        await this.updateSchema(`DROP TABLE ${escapeId(collectionName)}`)
    }


    async updateSchema(sql, catching) {
        try {
            const [operation] = await this.database.updateSchema([sql])

            await operation.promise()
        } catch (err) {
            const e = notThrowingTranslateErrorCodes(err)
            if (!catching || (catching && !(e instanceof catching))) {
                throw e
            }
        }
    }

    fixColumn(c) {
        return { ...c, name: patchFieldName(c.name) }
    }

    reformatFields(r) {
        const { type, subtype } = this.sqlSchemaTranslator.translateType(r['SPANNER_TYPE'])
        return {
            field: unpatchFieldName(r['COLUMN_NAME']),
            type,
            subtype
        }
    }

}


module.exports = SchemaProvider