const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors
import { EmptySort, isObject, AdapterFunctions, AdapterOperators, extractGroupByNames, extractProjectionFunctionsObjects, isEmptyFilter, specArrayToRegex } from '@wix-velo/velo-external-db-commons'
import { EmptyFilter } from './mongo_utils'
const { string_begins, string_ends, string_contains, urlized, matches } = AdapterOperators
const { count } = AdapterFunctions

export default class FilterParser {
    constructor() {
    }

    transform(filter: any) {
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return EmptyFilter
        }
        return {
            filterExpr: results[0].filterExpr
        }
    }

    parseAggregation(aggregation: { projection: any; postFilter: any }) {
        
        const groupByFields = extractGroupByNames(aggregation.projection)

        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const fieldsStatement = this.createFieldsStatement(projectionFunctions, groupByFields)
        
        const postFilter = this.parseFilter(aggregation.postFilter)[0]?.filterExpr

        return {
            fieldsStatement: { $group: fieldsStatement },
            havingFilter: { $match: postFilter || {} },
        }
    }

    createFieldsStatement(projectionFunctions: any[], groupByFields: any[]) {
        const fieldsStatement = projectionFunctions.reduce((pV: any, cV: { alias: any; function: any; name: any }) => ({ ...pV, ...{ [cV.alias]: this.parseFuncObject(cV.function, cV.name) } }), {})
        fieldsStatement._id = groupByFields.reduce((pV: any, cV: any) => ({ ...pV, ...{ [cV]: `$${cV}` } }), {})
        return fieldsStatement
    }

    parseFuncObject(func: string, fieldName: any) {
        if (func === count) return { $sum: 1 }
        return { [this.adapterFunctionToMongo(func)]: `$${fieldName}` }
    }
    
    adapterFunctionToMongo(func: any) {
        return `$${func}`
    }

    parseFilter(filter: { operator: any; fieldName: any; value: any }): any {
        if (isEmptyFilter(filter)) {
            return []
        }
        const { operator, fieldName, value } = filter
        const mongoOp = this.adapterOperatorToMongoOperator(operator)

        if (this.isMultipleFieldOperator(mongoOp)) {
            const res = value.map( this.parseFilter.bind(this) )
            return [{ filterExpr: { [mongoOp]: res.map((r: { filterExpr: any }[]) => r[0]?.filterExpr || EmptyFilter.filterExpr) } }]
        }

        if (mongoOp === '$not') {
            const res = this.parseFilter(value[0])
            return [{ filterExpr: { $nor: [res[0].filterExpr] } }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
            return [{ filterExpr: { [fieldName]: { $regex: this.valueForStringOperator(operator, value), $options: 'i' } } }]
        }

        if (operator === urlized) {
            return [{
                filterExpr: { [fieldName]: { $regex: `/${value.map((s: string) => s.toLowerCase()).join('.*')}/i` } }
            }]
        }

        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'i' : ''
            return [{
                filterExpr: { [fieldName]: { $regex: specArrayToRegex(value.spec), $options: `${ignoreCase}` } }
            }]
        }

        return [{ filterExpr: { [fieldName]: { [mongoOp]: this.valueForOperator(value, mongoOp) } } }]
    }

    isMultipleFieldOperator(operator: string) {
        return ['$and', '$or'].includes(operator)
    }

    valueForStringOperator(operator: any, value: any) {
        switch (operator) {
            case string_contains:
                return value
            case string_begins:
                return `^${value}`
            case string_ends:
                return `${value}$`
        }
    }

    isSingleFieldStringOperator(operator: string) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    valueForOperator(value: string | any[] | undefined, operator: string) {
        if (operator === '$in') {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return value
        }
        else if (operator === '$eq' && value === undefined) {
            return null
        }

        return value
    }

    adapterOperatorToMongoOperator(operator: any) {
        return `$${operator}`
    }

    orderBy(sort: { fieldName: any; direction: any }[]) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EmptySort
        }

        const results = sort.flatMap(this.parseSort)
        if (results.length === 0) {
            return EmptySort
        }
        return {
            sortExpr: { sort: results.map(result => result.expr) }
        }
    }

    parseSort({ fieldName, direction } : { fieldName: any; direction: any }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'asc' : 'desc'

        return {
            expr: [fieldName, dir]
        }
    }

    selectFieldsFor(projection: any[]) {
        return projection.reduce((pV: any, cV: any) => (
            { ...pV, [cV]: 1 }
        ), { _id: 0 })
    }

}