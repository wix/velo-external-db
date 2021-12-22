const { CannotModifySystemField } = require('./errors')

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

const queryOperatorsFor = {
    number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'hasSome'],
    text: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'hasSome', 'urlized'],
    boolean: ['eq'],
    url: ['eq', 'ne', 'contains', 'hasSome', 'urlized'],
    datetime: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
    image: [],
    object: ['eq', 'ne', 'contains'],
}

const asWixSchema = (fields, collectionName) => {
    return {
        id: collectionName,
        displayName: collectionName,
        allowedOperations: [
            'get',
            'find',
            'count',
            'update',
            'insert',
            'remove'
        ],
        maxPageSize: 50,
        ttl: 3600,
        fields: fields.reduce( (o, r) => ( { ...o, [r.field]: {
                displayName: r.field,
                type: r.type,
                queryOperators: queryOperatorsFor[r.type],
            } }), {} )
    }
}

const asWixSchemaHeaders = collectionName => {
    return {
        id: collectionName,
        displayName: collectionName,
        allowedOperations: [
            'get',
            'find',
            'count',
            'update',
            'insert',
            'remove'
        ],
        maxPageSize: 50,
        ttl: 3600,
    }
}

const validateSystemFields = (columnName) => {
    if (SystemFields.find(f => f.name === columnName)) {
        throw new CannotModifySystemField('Cannot modify system field')
    }
    return Promise.resolve()
}

const parseTableData = data => data.reduce((o, r) => {
                                                    const arr = o[r.table_name] || []
                                                    arr.push(r)
                                                    o[r.table_name] = arr
                                                    return o
                                                }, {})

const SchemaOperations = Object.freeze({
    LIST: 1,
    LIST_HEADERS: 2,
    CREATE: 3,
    DROP: 4, 
    ADD_COLUMN: 5,
    REMOVE_COLUMN: 6,
    DESCRIBE_COLLECTION: 7
})

module.exports = { SystemFields, asWixSchema, validateSystemFields, parseTableData,
                        asWixSchemaHeaders, SchemaOperations }