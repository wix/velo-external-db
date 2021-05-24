const { promisify } = require('util')
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CannotModifySystemField } = require('../../../error/errors')

const SystemFields = [
    {
        name: '_id', type: 'varchar(256)', isPrimary: true
    },
    {
        name: '_createdDate', type: 'timestamp'
    },
    {
        name: '_updatedDate', type: 'timestamp'
    },
    {
        name: '_owner', type: 'varchar(256)'
    }]

const TypeConverter = [
    {
        wixDataType: 'text',
        dbType: 'varchar'
    },

    {
        wixDataType: 'number',
        dbType: 'decimal'
    },

    {
        wixDataType: 'number',
        dbType: 'integer'
    },

    {
        wixDataType: 'number',
        dbType: 'int'
    },

    {
        wixDataType: 'boolean',
        dbType: 'tinyint'
    },

    {
        wixDataType: 'datetime',
        dbType: 'timestamp'
    },

    {
        wixDataType: 'object',
        dbType: 'json'
    },
]

class SchemaProvider {
    constructor(pool) {
        this.pool = pool

        this.systemFields = SystemFields
    }

    async list() {
        const tables = await promisify(this.pool.query).bind(this.pool)('SHOW TABLES')

        return Promise.all(tables.map(r => Object.values(r)[0])
                                 .map( this.describeCollection.bind(this) ))
    }

    async create(collectionName, columns) {
        const dbColumnsSql = this.systemFields.concat(columns || [])
                                 .map( this.columnToDbColumnSql.bind(this) )
                                 .join(', ')
        const primaryKeySql = this.systemFields.filter(f => f.isPrimary).map(f => `\`${f.name}\``).join(', ')

        await promisify(this.pool.query).bind(this.pool)(`CREATE TABLE IF NOT EXISTS ?? (${dbColumnsSql}, PRIMARY KEY (${primaryKeySql}))`,
                                                         [collectionName].concat((columns || []).map(c => c.name)))
    }

    async addColumn(collectionName, column) {
        try {
            await this.validateSystemFields(column.name)
            await promisify(this.pool.query).bind(this.pool)(`ALTER TABLE ?? ADD ?? ${column.type} ${this.defaultForColumnType(column.type)}`, [collectionName, column.name])
        } catch (err) {
            this.translateErrorCodesFor(err)
        }
    }

    translateErrorCodesFor(err) {
        switch (err.code) {
            case 'SYSTEM_FIELD':
                throw err
            case 'ER_CANT_DROP_FIELD_OR_KEY':
                throw new FieldDoesNotExist('Collection does not contain a field with this name')
            case 'ER_DUP_FIELDNAME':
                throw new FieldAlreadyExists('Collection already has a field with the same name')
            case 'ER_NO_SUCH_TABLE':
                throw new CollectionDoesNotExists('Collection does not exists')
            default :
                console.log(err)
                throw new Error(`default ${err.code}`)
        }
    }

    async removeColumn(collectionName, columnName) {
        try {
            await this.validateSystemFields(columnName)
            return await promisify(this.pool.query).bind(this.pool)(`ALTER TABLE ?? DROP COLUMN ??`, [collectionName, columnName])
        } catch (err) {
            this.translateErrorCodesFor(err)
        }
    }

    async describeCollection(collectionName) {
        const res = await promisify(this.pool.query).bind(this.pool)('DESCRIBE ??', [collectionName])
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
                    type: this.translateType(r.Type),
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

    translateType(dbType) {
        const type = dbType.toLowerCase()
                           .split('(')
                           .shift()
        return TypeConverter.find(t => t.dbType === type).wixDataType

    }


    defaultForColumnType(type) {
        if (type === 'timestamp') {
            return 'DEFAULT CURRENT_TIMESTAMP'
        }
        return ''
    }

    columnToDbColumnSql(f) {
        return `${f.name} ${f.type} ${this.defaultForColumnType(f.type)}`
    }


    validateSystemFields(columnName) {
        if (SystemFields.find(f => f.name === columnName)) {
            throw new CannotModifySystemField('Cannot modify system field')
        }
        return Promise.resolve()
    }
}

module.exports = {SchemaProvider, SystemFields}