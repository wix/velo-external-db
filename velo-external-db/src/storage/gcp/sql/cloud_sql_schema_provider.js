const { promisify } = require('util')
const translateErrorCodes = require('./sql_exception_translator')
const SchemaColumnTranslator = require('./sql_schema_translator')
const { CannotModifySystemField } = require('../../../error/errors')

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

        this.query = promisify(this.pool.query).bind(this.pool)
    }

    async list() {
        const tables = await this.query('SHOW TABLES')

        return Promise.all(tables.map(r => Object.values(r)[0])
                                 .map( this.describeCollection.bind(this) ))
    }

    async create(collectionName, columns) {
        const dbColumnsSql = [...this.systemFields, ...(columns || [])].map( c => this.sqlSchemaTranslator.columnToDbColumnSql(c) )
                                                                       .join(', ')
        const primaryKeySql = this.systemFields.filter(f => f.isPrimary).map(f => `\`${f.name}\``).join(', ')

        await this.query(`CREATE TABLE IF NOT EXISTS ?? (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                         [collectionName, ...(columns || []).map(c => c.name)])
    }

    async addColumn(collectionName, column) {
        await this.validateSystemFields(column.name)
        await this.query(`ALTER TABLE ?? ADD ?? ${this.sqlSchemaTranslator.dbTypeFor(column)}`, [collectionName, column.name])
                  .catch( translateErrorCodes )
    }

    async removeColumn(collectionName, columnName) {
        await this.validateSystemFields(columnName)
        return await this.query(`ALTER TABLE ?? DROP COLUMN ??`, [collectionName, columnName])
                         .catch( translateErrorCodes )
    }

    async describeCollection(collectionName) {
        const res = await this.query('DESCRIBE ??', [collectionName])
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
            fields: res.reduce( (o, r) => Object.assign(o, { [r.Field]: {
                    displayName: r.Field,
                    type: this.sqlSchemaTranslator.translateType(r.Type),
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