const moment = require('moment')
const { InvalidQuery } = require('./errors')


const EmptySort = {
    sortExpr: '',
}

const EmptyFilter = {
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

const isDate = d => {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/
    return d instanceof Date || Object.prototype.toString.call(d) === '[object Date]' || (typeof d === 'string' && reISO.test(d))
}

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
    urlized: 'urlized',
    matches: 'matches'
}

const AdapterFunctions = { 
    avg: 'avg',
    max: 'max',
    min: 'min',
    sum: 'sum',
    count: 'count'
}

const extractGroupByNames = (projection) =>  projection.filter(f => !f.function).map( f => f.name ) 

const extractProjectionFunctionsObjects = (projection) => projection.filter(f => f.function)

const isNull = (value) => (value === null || value === undefined)

const specArrayToRegex = (spec) => {
    if (!Array.isArray(spec)) {
        throw new InvalidQuery('$matches must have array - spec property')
    }
    return spec.map(spec => {
        if (spec.type === 'literal') {
            return spec.value
        }
        if (spec.type === 'anyOf') {
            return `[${spec.value}]`
        }
    }).join('')
}

module.exports = { EmptyFilter, EmptySort, patchDateTime, asParamArrays, isObject, isDate,
                     updateFieldsFor, isEmptyFilter, AdapterOperators, AdapterFunctions,
                     extractGroupByNames, extractProjectionFunctionsObjects, isNull, specArrayToRegex }