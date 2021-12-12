const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_SORT, isObject, extractFilterObjects, patchAggregationObject, isEmptyFilter } = require('velo-external-db-commons')
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
        const _aggregation = patchAggregationObject(aggregation)
        const havingFilter = this.parseFilter(postFilter)
        const fieldsStatement = {}
        if (isObject(_aggregation._id)) {
            const _id = Object.keys(_aggregation._id)
                              .reduce((r, c) => ( { ...r, [_aggregation._id[c]]: `$${_aggregation._id[c]}` } ), {})
            Object.assign(fieldsStatement, { _id } )
        } else {
            Object.assign(fieldsStatement, { [_aggregation._id]: `$${_aggregation._id}` })
        }
        Object.keys(_aggregation)
              .filter(f => f !== '_id')
              .forEach(fieldAlias => {
                  Object.entries(_aggregation[fieldAlias])
                        .forEach(([func, field]) => {
                            Object.assign(fieldsStatement, { [fieldAlias]: { [func]: `$${field}` } })
                        })
              })
        const filterObj = havingFilter.reduce((r, c) => ( { ...r, ...c } ), {})
        return {
            fieldsStatement: { $group: fieldsStatement },
            havingFilter: { $match: filterObj.filterExpr || {} },
        }
    }

    parseFilter(filter) {
        if (isEmptyFilter(filter)) {
            return []
        }
        const { operator, fieldName, value } = extractFilterObjects(filter)
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