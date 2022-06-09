import { CannotModifySystemField } from './errors'

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
    text: ['eq', 'ne', 'contains', 'startsWith', 'endsWith', 'hasSome', 'matches', 'gt', 'gte', 'lt', 'lte'],
    boolean: ['eq'],
    url: ['eq', 'ne', 'contains', 'hasSome'],
    datetime: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
    image: [],
    object: ['eq', 'ne'],
}

const QueryOperationsByFieldType: any= {
    number: [...QueryOperatorsByFieldType.number, 'urlized'],
    text: [...QueryOperatorsByFieldType.text, 'urlized', 'isEmpty', 'isNotEmpty'],
    boolean: QueryOperatorsByFieldType.boolean,
    url: [...QueryOperatorsByFieldType.url, 'urlized'],
    datetime: [...QueryOperatorsByFieldType.datetime],
    image: QueryOperatorsByFieldType.image,
    object: [...QueryOperatorsByFieldType.object, 'isEmpty', 'isNotEmpty'],
}



const SchemaOperations = Object.freeze({
    List: 'list',
    ListHeaders: 'listHeaders',
    Create: 'createCollection',
    Drop: 'dropCollection',
    AddColumn: 'addColumn',
    RemoveColumn: 'removeColumn',
    Describe: 'describeCollection',
    FindWithSort: 'findWithSort',
    Aggregate: 'aggregate',
    BulkDelete: 'bulkDelete',
    Truncate: 'truncate',
    UpdateImmediately: 'updateImmediately',
    DeleteImmediately: 'deleteImmediately',
    StartWithCaseSensitive: 'startWithCaseSensitive',
    StartWithCaseInsensitive: 'startWithCaseInsensitive',
    Projection: 'projection',
    FindObject: 'findObject',
    Matches: 'matches',
    NotOperator: 'not',
    IncludeOperator: 'include',
})

const AllSchemaOperations = Object.values(SchemaOperations)

const ReadWriteOperations = ['get', 'find', 'count', 'update', 'insert', 'remove']
const ReadOnlyOperations = ['get']

const asWixSchema = ({ id, allowedOperations, allowedSchemaOperations, fields }: { [x: string]: any }) => {
    return {
        id,
        displayName: id,
        allowedOperations,
        allowedSchemaOperations,
        maxPageSize: 50,
        ttl: 3600,
        fields: fields.reduce((o: any, r: { field: any; type: any; queryOperators: any }) => ({
            ...o, [r.field]: {
                displayName: r.field,
                type: r.type,
                queryOperators: r.queryOperators,
            }
        }), {})
    }
}

const asWixSchemaHeaders = (collectionName: any) => {
    return {
        id: collectionName,
        displayName: collectionName,
        maxPageSize: 50,
        ttl: 3600,
    }
}

const validateSystemFields = (columnName: string) => {
    if (SystemFields.find(f => f.name === columnName)) {
        throw new CannotModifySystemField('Cannot modify system field')
    }
    return Promise.resolve()
}

const parseTableData = (data: any[]) => data.reduce((o: { [x: string]: any }, r: { table_name: string | number }) => {
    const arr = o[r.table_name] || []
    arr.push(r)
    o[r.table_name] = arr
    return o
}, {})

const allowedOperationsFor = ({ fields }: any) => fields.find((c: { field: string }) => c.field === '_id') ? ReadWriteOperations : ReadOnlyOperations

const appendQueryOperatorsTo = (fields: any[]) => fields.map((f: { type: string | number }) => ({ ...f, queryOperators: QueryOperationsByFieldType[f.type] }))

export {
    SystemFields, asWixSchema, validateSystemFields, parseTableData,
    asWixSchemaHeaders, SchemaOperations, AllSchemaOperations,
    allowedOperationsFor, appendQueryOperatorsTo, QueryOperatorsByFieldType,
    ReadWriteOperations, ReadOnlyOperations
}
