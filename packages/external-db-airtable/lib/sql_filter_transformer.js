const { InvalidQuery } = require('velo-external-db-commons').errors
const { isObject } = require('velo-external-db-commons')
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
        if (!filter || !isObject(filter) || filter.operator === undefined) {
            return []
        }


        switch (filter.operator) {
            case '$and':
            case '$or':
                const res = filter.value.map(this.parseFilter.bind(this))
                const op = filter.operator === '$and' ? 'AND' : 'OR' 
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr(op, res)
                }]

            case '$not':
                const res2 = this.parseFilter(filter.value)
                return [{
                    filterExpr: `NOT(${res2[0].filterExpr})`
                }]
            case '$hasSome': //todo - refactor
                if (filter.value === undefined || filter.value.length === 0) {
                    throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
                }

                const ress = filter.value.map(val => { return { operator: '$eq', value: val, fieldName:filter.fieldName } })
                const ress2 = ress.map(this.parseFilter.bind(this))
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr('OR', ress2)
                }]

        }


        if (this.isSingleFieldOperator(filter.operator)) {
            return [{
                filterExpr: `${filter.fieldName} ${this.veloOperatorToAirtableOperator(filter.operator, filter.value)} ${this.valueForOperator(filter.value, filter.operator)}` // TODO: value for operator?
            }]
        }

        if (this.isSingleFieldStringOperator(filter.operator)) {
           return[{
               filterExpr: `REGEX_MATCH({${filter.fieldName}},'${this.valueForStringOperator(filter.operator, filter.value)}')`}]
        }

        if (filter.operator === '$urlized') {
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

    veloOperatorToAirtableOperator(operator, value) {
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