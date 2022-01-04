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

const QueryOperatorsFor = {
    number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'hasSome'],
    text: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'hasSome', 'urlized'],
    boolean: ['eq'],
    url: ['eq', 'ne', 'contains', 'hasSome', 'urlized'],
    datetime: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
    image: [],
    object: ['eq', 'ne', 'contains'],
}

const SchemaOperations = Object.freeze({
    LIST: 'list',
    LIST_HEADERS: 'listHeaders',
    CREATE: 'createCollection',
    DROP: 'dropCollection', 
    ADD_COLUMN: 'addColumn',
    REMOVE_COLUMN: 'removeColumn',
    DESCRIBE_COLLECTION: 'describeCollection',
})

const AllSchemaOperations = Object.values(SchemaOperations)

const ReadWriteOperations = ['get', 'find', 'count', 'update', 'insert', 'remove']
const ReadOnlyOperations = ['get']

const asWixSchema = (collection, allowedSchemaOperations) => {
    return {
        id: collection.id,
        displayName: collection.id,
        allowedOperations: allowedOperationsFor(collection),
        allowedSchemaOperations,
        maxPageSize: 50,
        ttl: 3600,
        fields: collection.fields.reduce( (o, r) => ( { ...o, [r.field]: {
                displayName: r.field,
                type: r.type,
                queryOperators: QueryOperatorsFor[r.type],
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

const supportedSchemaOperationsFor = (impl) => {
    const { LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION } = SchemaOperations

    switch (impl.toLowerCase()) {
        case 'airtable':
        case 'bigquery':
        case 'dynamodb':
        case 'firestore':
        case 'mongo':
        case 'mssql':
        case 'mysql':
        case 'postgres':
        case 'spanner':
            return [LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION]
        
        case 'google-sheet':
            return [LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, DESCRIBE_COLLECTION]
    
        default:
            throw new Error('Unknown implementation')
    }
}

const allowedOperationsFor = (collection) => {
    return collection.fields.find(c => c.field === '_id') ? ReadWriteOperations : ReadOnlyOperations 
}

module.exports = { SystemFields, asWixSchema, validateSystemFields, parseTableData,
                        asWixSchemaHeaders, SchemaOperations, AllSchemaOperations, supportedSchemaOperationsFor }