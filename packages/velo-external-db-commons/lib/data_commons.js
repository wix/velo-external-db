const moment = require('moment')

const EMPTY_SORT = {
    sortExpr: '',
}

const EMPTY_FILTER = {
    filterExpr: '',
    parameters: [],
    offset: 1
}

const patchDateTime = (item) => {
    const obj = {}
    for (const key of Object.keys(item)) {
        const value = item[key]
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

        if (value instanceof Date) {
            obj[key] = moment(value).format('YYYY-MM-DD HH:mm:ss')
        } else if (reISO.test(value)) {
            obj[key] = moment(new Date(value)).format('YYYY-MM-DD HH:mm:ss')
        } else {
            obj[key] = value
        }
    }
    return obj
}

const asParamArrays = item => Object.values(item)

const isObject = (o) => typeof o === 'object' && o !== null

const updateFieldsFor = item => {
    return Object.keys(item).filter(f => f !== '_id')
}


const isEmptyFilter = (filter) => {
    return (!filter || !filter.operator)
} 

const AdapterOperators = {
    eq: 'eq',
    gt: 'gt',
    gte: 'gte',
    include: 'in', 
    lt: 'lt',
    lte: 'lte',
    ne: 'ne',
    string_begins: 'begins',
    string_ends: 'ends',
    string_contains: 'contains',
    and: 'and',
    or: 'or',
    not: 'not',
    urlized: 'urlized'
}

const AdapterFunctions = { 
    avg: 'avg',
    max: 'max',
    min: 'min',
    sum: 'sum',
    count: 'count'
}

const wixOperatorToAdapterOperator = operator => {
    switch (operator) {
        case '$eq':
            return AdapterOperators.eq
        case '$ne':
            return AdapterOperators.ne
        case '$lt':
            return AdapterOperators.lt
        case '$lte':
            return AdapterOperators.lte
        case '$gt': 
            return AdapterOperators.gt
        case '$gte':
            return AdapterOperators.gte
        case '$hasSome':
            return AdapterOperators.include
        case '$contains':
            return AdapterOperators.string_contains
        case '$startsWith':
            return AdapterOperators.string_begins
        case '$endsWith':
            return AdapterOperators.string_ends
        case '$or':
            return AdapterOperators.or
        case '$and':
            return AdapterOperators.and
        case '$not':
            return AdapterOperators.not
        case '$urlized':
            return AdapterOperators.urlized
    }
}

const extractGroupByNames = (projection) =>  projection.filter(f => !f.function).map( f => f.name ) 

const extractProjectionFunctionsObjects = (projection) => projection.filter(f => f.function)

module.exports = { EMPTY_FILTER, EMPTY_SORT, patchDateTime, asParamArrays, isObject, updateFieldsFor,
                     isEmptyFilter, AdapterOperators, AdapterFunctions,
                     extractGroupByNames, extractProjectionFunctionsObjects,
                     wixOperatorToAdapterOperator }