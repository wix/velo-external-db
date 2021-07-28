const translateErrorCodes = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { escapeIdentifier } = require('./postgres_utils')
const { CannotModifySystemField } = require('velo-external-db-commons')

const SystemFields = [
    {
        name: '_id', type: 'text', subtype: 'string', precision: '50', isPrimary: true
    },
    {
        name: '_createdDate', type: 'datetime', subtype: 'datetime'
    },
    {
        name: '_updatedDate', type: 'datetime', subtype: 'datetime'
    },
    {
        name: '_owner', type: 'text', subtype: 'string', precision: '50'
    }]

class SchemaProvider {
    constructor(pool) {
        this.pool = pool

        this.systemFields = SystemFields
        this.sqlSchemaTranslator = new SchemaColumnTranslator()
    }

    async list() {
        const data = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type FROM information_schema.columns WHERE table_schema = $1 ORDER BY table_name', ['public'])

        const tables = data.rows.reduce((o, r) => {
            const arr = o[r.table_name] || []
            arr.push(r)
            o[r.table_name] = arr
            return o
        }, {})

        return Object.entries(tables)
                     .map(([collectionName, rs]) => this.asWixSchema(rs, collectionName))
    }


    async create(collectionName, _columns) {
        const columns = _columns || []
        const dbColumnsSql = [...this.systemFields, ...columns].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                               .join(', ')
        const primaryKeySql = this.systemFields.filter(f => f.isPrimary).map(f => escapeIdentifier(f.name)).join(', ')

        await this.pool.query(`CREATE TABLE IF NOT EXISTS ${escapeIdentifier(collectionName)} (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`)
                             // /* [...columns.map(c => c.name)]*/)
    }

    async addColumn(collectionName, column) {
        await this.validateSystemFields(column.name)

        await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} ADD ${escapeIdentifier(column.name)} ${this.sqlSchemaTranslator.dbTypeFor(column)}`)
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName, columnName) {
        await this.validateSystemFields(columnName)

        return await this.pool.query(`ALTER TABLE ${escapeIdentifier(collectionName)} DROP COLUMN ${escapeIdentifier(columnName)}`)
                         .catch( translateErrorCodes )
    }

    async describeCollection(collectionName) {
        const res = await this.pool.query('SELECT table_name, column_name AS field, data_type, udt_name AS type, character_maximum_length FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY table_name', ['public', collectionName])
        return this.asWixSchema(res.rows, collectionName)
    }

    asWixSchema(res, collectionName) {
        return {
            id: collectionName,
            displayName: collectionName,
            allowedOperations: [
                "get",
                "find",
                "count",
                "update",
                "insert",
                "remove"
            ],
            maxPageSize: 50,
            ttl: 3600,
            fields: res.reduce( (o, r) => Object.assign(o, { [r.field]: {
                    displayName: r.field,
                    type: this.sqlSchemaTranslator.translateType(r.type),
                    queryOperators: [
                        "eq",
                        "lt",
                        "gt",
                        "hasSome",
                        "and",
                        "lte",
                        "gte",
                        "or",
                        "not",
                        "ne",
                        "startsWith",
                        "endsWith" // todo: customize this list according to type
                    ]
                } }), {} )
        }
    }

    validateSystemFields(columnName) {
        if (SystemFields.find(f => f.name === columnName)) {
            throw new CannotModifySystemField('Cannot modify system field')
        }
        return Promise.resolve()
    }
}

module.exports = {SchemaProvider, SystemFields}