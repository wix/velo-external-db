const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_SORT, isObject, getFilterObject } = require('velo-external-db-commons')
const { EMPTY_FILTER } = require('./mongo_utils')

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return EMPTY_FILTER
        }
        return {
            filterExpr: results[0].filterExpr
        }
    }

    parseAggregation(aggregation, postFilter) {
        const havingFilter = this.parseFilter(postFilter)
        const fieldsStatement = {}
        if (isObject(aggregation._id)) {
            const _id = Object.keys(aggregation._id)
                              .reduce((r, c) => ( { ...r, [aggregation._id[c].substring(1)]: `${aggregation._id[c]}` } ), {})
            Object.assign(fieldsStatement, { _id } )
        } else {
            Object.assign(fieldsStatement, { [aggregation._id.substring(1)]: `${aggregation._id}` })
        }
        
        Object.keys(aggregation)
              .filter(f => f !== '_id')
              .forEach(fieldAlias => {
                  Object.entries(aggregation[fieldAlias])
                        .forEach(([func, field]) => {
                            Object.assign(fieldsStatement, { [fieldAlias]: { [func]: `${field}` } })
                        })
              })
        const filterObj = havingFilter.reduce((r, c) => ( { ...r, ...c } ), {})
        return {
            fieldsStatement: { $group: fieldsStatement },
            havingFilter: { $match: filterObj.filterExpr || {} },
        }
    }

    parseFilter(filter) {
        if (!filter || !isObject(filter) || Object.keys(filter)[0] === undefined ) {
            return []
        }
        const { operator, fieldName, value } = getFilterObject(filter)
        const mongoOp = this.veloOperatorToMongoOperator(operator)

        if (this.isMultipleFieldOperator(mongoOp)) {
            const res = value.map( this.parseFilter.bind(this) )
            return [{ filterExpr: { [mongoOp]: res.map(r => r[0].filterExpr) } }]
        }

        if (mongoOp === '$not') {
            const res = this.parseFilter(value[0])
            return [{ filterExpr: { [mongoOp]: res[0].filterExpr } }]
        }

        if (this.isSingleFieldStringOperator(mongoOp)) {
            return [{ filterExpr: { [fieldName]: { $regex: this.valueForStringOperator(mongoOp, value) } } }]
        }

        if (mongoOp === '$urlized') {
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
            case '$contains':
                return value
            case '$startsWith':
                return `^${value}`
            case '$endsWith':
                return `${value}$`
        }
    }

    isSingleFieldStringOperator(operator) {
        return ['$contains', '$startsWith', '$endsWith'].includes(operator)
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

    veloOperatorToMongoOperator(operator) {
        switch (operator) {
            case '$hasSome':
                return '$in'
            default:
                return operator
        }
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EMPTY_SORT
        }

        const results = sort.flatMap(this.parseSort)
        if (results.length === 0) {
            return EMPTY_SORT
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

}

module.exports = FilterParser