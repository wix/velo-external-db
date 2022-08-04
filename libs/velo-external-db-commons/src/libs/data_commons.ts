import * as moment from 'moment'
import { InvalidQuery } from './errors'


export const EmptySort = {
    sortExpr: '',
}

export const EmptyFilter = {
    filterExpr: '',
    parameters: [],
    offset: 1
}

export const patchDateTime = (item: { [x: string]: any }) => {
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

export const asParamArrays = (item: { [s: string]: unknown } | ArrayLike<unknown>) => Object.values(item)

export const isObject = (o: any) => typeof o === 'object' && o !== null

export const isDate = (d: any) => {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/
    return d instanceof Date || Object.prototype.toString.call(d) === '[object Date]' || (typeof d === 'string' && reISO.test(d))
}

export const updateFieldsFor = (item: object) => {
    return Object.keys(item).filter(f => f !== '_id')
}


export const isEmptyFilter = (filter: any) => {
    return (!filter || !filter.operator)
}

export const AdapterOperators = {
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


export const extractGroupByNames = (projection: any[]) => projection.filter((f: { function: any }) => !f.function).map((f: { name: any }) => f.name)

export const extractProjectionFunctionsObjects = (projection: any[]) => projection.filter((f: { function: any }) => f.function)

export const isNull = (value: any) => (value === null || value === undefined)

export const specArrayToRegex = (spec: any[]) => {
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
