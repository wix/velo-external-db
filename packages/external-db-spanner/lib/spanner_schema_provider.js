const { SystemFields, validateSystemFields, asWixSchema, parseTableData } = require('velo-external-db-commons')
const { CollectionDoesNotExists, CollectionAlreadyExists } = require('velo-external-db-commons').errors
const SchemaColumnTranslator = require('./sql_schema_translator')
const { notThrowingTranslateErrorCodes } = require('./sql_exception_translator')
const { recordSetToObj, escapeId, patchFieldName, unpatchFieldName, escapeFieldId} = require('./spanner_utils')

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
        };

        const [rows] = await this.database.run(query);
        const res = recordSetToObj(rows)

        const tables = parseTableData(res)

        return Object.entries(tables)
                     .map(([collectionName, rs]) => asWixSchema(rs.map( this.reformatFields.bind(this) ), collectionName))
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
        };

        const [rows] = await this.database.run(query);
        const res = recordSetToObj(rows)

        if (res.length === 0) {
            throw new CollectionDoesNotExists('Collection does not exists')
        }

        return asWixSchema(res.map( this.reformatFields.bind(this) ), collectionName)
    }

    async drop(collectionName) {
        await this.updateSchema(`DROP TABLE ${escapeId(collectionName)}`)
    }


    async updateSchema(sql, catching) {
        try {
            const [operation] = await this.database.updateSchema([sql])

            await operation.promise();
        } catch (err) {
            const e = notThrowingTranslateErrorCodes(err)
            if (!catching || (catching && !(e instanceof catching))) {
                throw e
            }
        }
    }

    fixColumn(c) {
        return Object.assign({}, c, { name: patchFieldName(c.name)})
    }

    reformatFields(r) {
        return {
            field: unpatchFieldName(r['COLUMN_NAME']),
            type: this.sqlSchemaTranslator.translateType(r['SPANNER_TYPE']),
        }
    }

}


module.exports = SchemaProvider