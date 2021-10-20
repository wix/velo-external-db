const {CannotModifySystemField} = require('./errors')

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


const asWixSchema = (res, collectionName) => {
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
        fields: res.reduce( (o, r) => ( { ...o, [r.field]: {
                displayName: r.field,
                type: r.type,
                queryOperators: [
                    'eq',
                    'lt',
                    'gt',
                    'hasSome',
                    'and',
                    'lte',
                    'gte',
                    'or',
                    'not',
                    'ne',
                    'startsWith',
                    'endsWith' // todo: customize this list according to type
                ]
            } }), {} )
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


module.exports = { SystemFields, asWixSchema, validateSystemFields, parseTableData }