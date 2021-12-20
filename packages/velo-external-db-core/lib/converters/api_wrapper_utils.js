const AdapterOperators = { //should not be here - in data_common or something
    eq: 'eq',
    gt: 'gt',
    gte: 'gte',
    in: 'in', 
    lt: 'lt',
    lte: 'lte',
    ne: 'ne',
    string_begins: 'begins',
    string_ends: 'ends',
    string_contains: 'contains',
    and: 'and',
    or: 'or',
    not: 'not'
}

const AdapterFunctions = { //should not be here - in data_common or something
    avg: 'avg',
    max: 'max',
    min: 'min',
    sum: 'sum',
    count: 'count'
}

const EMPTY_FILTER = {}

const projectionFieldFor = (fieldName, fieldAlias) => (
    { name: fieldName.substring(1), alias: fieldAlias || fieldName.substring(1) }
)

const projectionFunctionFor = (fieldName, fieldAlias, func) => {
    if (isCountFunc(func, fieldName))
        return { alias: fieldAlias, function: AdapterFunctions.count }
    return { name: fieldName.substring(1), alias: fieldAlias || fieldName.substring(1), function: func }
}

const isCountFunc = (func, value) => (func === AdapterFunctions.sum && value === 1)

module.exports = { AdapterOperators, AdapterFunctions,  EMPTY_FILTER, projectionFieldFor, projectionFunctionFor }