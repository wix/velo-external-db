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

const QueryOperatorsByFieldType = {
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

const asWixSchema = ({ id, allowedOperations, allowedSchemaOperations, fields }) => {
    return {
        id,
        displayName: id,
        allowedOperations,
        allowedSchemaOperations,
        maxPageSize: 50,
        ttl: 3600,
        fields: fields.reduce( (o, r) => ( { ...o, [r.field]: {
                displayName: r.field,
                type: r.type,
                queryOperators: r.queryOperators,
            } }), {} )
    }
}

const asWixSchemaHeaders = collectionName => {
    return {
        id: collectionName,
        displayName: collectionName,
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

const allowedOperationsFor = ({ fields }) => fields.find(c => c.field === '_id') ? ReadWriteOperations : ReadOnlyOperations 

const appendQueryOperatorsTo = (fields) => fields.map(f => ({ ...f, queryOperators: QueryOperatorsByFieldType[f.type] }))

module.exports = { SystemFields, asWixSchema, validateSystemFields, parseTableData,
                    asWixSchemaHeaders, SchemaOperations, AllSchemaOperations,
                    allowedOperationsFor, appendQueryOperatorsTo, QueryOperatorsByFieldType,
                    ReadWriteOperations, ReadOnlyOperations }
