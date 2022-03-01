const { InvalidQuery } = require('velo-external-db-commons').errors
const { EmptySort, isObject, AdapterFunctions, AdapterOperators, extractGroupByNames, extractProjectionFunctionsObjects, isEmptyFilter } = require('velo-external-db-commons')
const { EmptyFilter } = require('./mongo_utils')
const { string_begins, string_ends, string_contains, urlized } = AdapterOperators
const { count } = AdapterFunctions

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return EmptyFilter
        }
        return {
            filterExpr: results[0].filterExpr
        }
    }

    parseAggregation(aggregation) {
        
        const groupByFields = extractGroupByNames(aggregation.projection)

        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const fieldsStatement = this.createFieldsStatement(projectionFunctions, groupByFields)
        
        const postFilter = this.parseFilter(aggregation.postFilter)[0]?.filterExpr

        return {
            fieldsStatement: { $group: fieldsStatement },
            havingFilter: { $match: postFilter || {} },
        }
    }

    createFieldsStatement(projectionFunctions, groupByFields) {
        const fieldsStatement = projectionFunctions.reduce((pV, cV) => ({ ...pV, ...{ [cV.alias]: this.parseFuncObject(cV.function, cV.name) } }), {})
        fieldsStatement._id = groupByFields.reduce((pV, cV) => ({ ...pV, ...{ [cV]: `$${cV}` } }), {})
        return fieldsStatement
    }

    parseFuncObject(func, fieldName) {
        if (func === count) return { $sum: 1 }
        return { [this.adapterFunctionToMongo(func)]: `$${fieldName}` }
    }
    
    adapterFunctionToMongo(func) {
        return `$${func}`
    }

    parseFilter(filter) {
        if (isEmptyFilter(filter)) {
            return []
        }
        const { operator, fieldName, value } = filter
        const mongoOp = this.adapterOperatorToMongoOperator(operator)

        if (this.isMultipleFieldOperator(mongoOp)) {
            const res = value.map( this.parseFilter.bind(this) )
            return [{ filterExpr: { [mongoOp]: res.map(r => r[0].filterExpr) } }]
        }

        if (mongoOp === '$not') {
            const res = this.parseFilter(value[0])
            return [{ filterExpr: { [mongoOp]: res[0].filterExpr } }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
            return [{ filterExpr: { [fieldName]: { $regex: this.valueForStringOperator(operator, value) } } }]
        }

        if (operator === urlized) {
            return [{
                filterExpr: { [fieldName]: { $regex: `/${value.map(s => s.toLowerCase()).join('.*')}/i` } }
            }]
        }
        return [{ filterExpr: { [fieldName]: { [mongoOp]: this.valueForOperator(value, mongoOp) } } }]

    }

    isMultipleFieldOperator(operator) {
        return ['$and', '$or'].includes(operator)
    }

    valueForStringOperator(operator, value) {
        switch (operator) {
            case string_contains:
                return `/${value}/i`
            case string_begins:
                return `/^${value}/i`
            case string_ends:
                return `/${value}$/i`
        }
    }

    isSingleFieldStringOperator(operator) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    valueForOperator(value, operator) {
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

    adapterOperatorToMongoOperator(operator) {
        switch (operator) {
            case '$hasSome':
                return '$in'
            default:
                return `$${operator}`
        }
    }

    orderBy(sort) {
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

    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'asc' : 'desc'

        return {
            expr: [fieldName, dir]
        }
    }

    selectFieldsFor(projection) {
        return projection.reduce((pV, cV) => (
            { ...pV, [cV]: 1 }
        ), { _id: 0 })
    }

}

module.exports = FilterParser