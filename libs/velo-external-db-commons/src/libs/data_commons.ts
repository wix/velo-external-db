import * as moment from 'moment'
import { InvalidQuery } from './errors'


const EmptySort = {
    sortExpr: '',
}

const EmptyFilter = {
    filterExpr: '',
    parameters: [],
    offset: 1
}

const patchDateTime = (item: { [x: string]: any }) => {
    const obj: { [x: string]: any } = {}
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

const asParamArrays = (item: { [s: string]: unknown } | ArrayLike<unknown>) => Object.values(item)

const isObject = (o: any) => typeof o === 'object' && o !== null

const isDate = (d: any) => {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/
    return d instanceof Date || Object.prototype.toString.call(d) === '[object Date]' || (typeof d === 'string' && reISO.test(d))
}

const updateFieldsFor = (item: {}) => {
    return Object.keys(item).filter(f => f !== '_id')
}


const isEmptyFilter = (filter: { operator: any }) => {
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

const extractGroupByNames = (projection: any[]) => projection.filter((f: { function: any }) => !f.function).map((f: { name: any }) => f.name)

const extractProjectionFunctionsObjects = (projection: any[]) => projection.filter((f: { function: any }) => f.function)

const isNull = (value: any) => (value === null || value === undefined)

const specArrayToRegex = (spec: any[]) => {
    if (!Array.isArray(spec)) {
        throw new InvalidQuery('$matches must have array - spec property')
    }
    return spec.map(specItemToRegex).join('')
}

type SpecType = 'literal' | 'anyOf'

const specItemToRegex = (spec: { type: SpecType; value: string | number }) => {
    if (spec.type === 'literal') {
        return spec.value
    }
    if (spec.type === 'anyOf') {
        return `[${spec.value}]`
    }
    
    throw new InvalidQuery('spec must have type of literal or anyOf')
}

export {
    EmptyFilter, EmptySort, patchDateTime, asParamArrays, isObject, isDate,
    updateFieldsFor, isEmptyFilter, AdapterOperators, AdapterFunctions,
    extractGroupByNames, extractProjectionFunctionsObjects, isNull, specArrayToRegex
}