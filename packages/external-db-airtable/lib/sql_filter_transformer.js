const { InvalidQuery } = require('velo-external-db-commons').errors
const { isObject, getFilterObject } = require('velo-external-db-commons')
const { EMPTY_SORT } = require ('./airtable_utils')

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return []
        }
        return {
            filterExpr: results[0].filterExpr
        }
    }


    parseFilter(filter) {
        if (!filter || !isObject(filter) || Object.keys(filter)[0] === undefined) {
            return []
        }

        const { operator, fieldName, value } =  getFilterObject(filter)

        switch (operator) {
            case '$and':
            case '$or':
                const res = value.map(this.parseFilter.bind(this))
                const op = operator === '$and' ? 'AND' : 'OR' 
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr(op, res)
                }]

            case '$not':
                const res2 = this.parseFilter(value[0])
                return [{
                    filterExpr: `NOT(${res2[0].filterExpr})`
                }]
            case '$hasSome': //todo - refactor
                if (value === undefined || value.length === 0) {
                    throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
                }

                const ress = value.map(val => { return { [fieldName]: { $eq: val }} })
                const ress2 = ress.map(this.parseFilter.bind(this))
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr('OR', ress2)
                }]

        }


        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${fieldName} ${this.veloOperatorToAirtableOperator(operator, value)} ${this.valueForOperator(value, operator)}` // TODO: value for operator?
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
           return[{
               filterExpr: `REGEX_MATCH({${fieldName}},'${this.valueForStringOperator(operator, value)}')` }]
        }

        if (operator === '$urlized') {
            console.error('not implemented')
        }
        return []
    }

    multipleFieldOperatorToFilterExpr(operator, values) {
        return `${operator}(${values.map(r => r[0]?.filterExpr).join(',')})`
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

    valueForOperator(value, operator) {
        if (operator === '$hasSome') {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return this.multipleFieldOperatorToFilterExpr('OR', value)
        }
        else if (operator === '$eq' && value === undefined) {
            return '""'
        }

        return `"${value}"`
    }

    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq'].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return ['$contains', '$startsWith', '$endsWith'].includes(operator)
    }

    veloOperatorToAirtableOperator(operator) {
        switch (operator) {
            case '$eq':
                return '='
            case '$ne':
                return '!='
            case '$lt':
                return '<'
            case '$lte':
                return '<='
            case '$gt':
                return '>'
            case '$gte':
                return '>='
        }
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EMPTY_SORT
        }

        const results=  sort.flatMap(this.parseSort)
        if (results.length === 0) {
            return EMPTY_SORT
        }
        return {
            sort: results
        }
    }

    // skipExpression(skip) {
    //     if (!skip) return {}
    //     return {
    //         pageSize: 1,
    //         offset: skip
    //     }
    // }

    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'asc' : 'desc'

        return { field: fieldName, direction: dir }

    }

}

module.exports = FilterParser