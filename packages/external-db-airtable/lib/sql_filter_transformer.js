const { InvalidQuery } = require('velo-external-db-commons').errors
const { isObject, AdapterOperators, isEmptyFilter } = require('velo-external-db-commons')
const { EmptySort } = require ('./airtable_utils')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized } = AdapterOperators

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
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter

        switch (operator) {
            case and:
            case or:
                const res = value.map(this.parseFilter.bind(this))
                const op = operator === and ? 'AND' : 'OR' 
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr(op, res)
                }]

            case not:
                const res2 = this.parseFilter(value[0])
                return [{
                    filterExpr: `NOT(${res2[0].filterExpr})`
                }]
            case include:
                if (value === undefined || value.length === 0) {
                    throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
                }

                const ress = value.map(val => { return { fieldName,
                                                         operator: eq,
                                                         value: val }
                                              }
                                      )
                const ress2 = ress.map(this.parseFilter.bind(this))
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr('OR', ress2)
                }]

        }


        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${fieldName} ${this.adapterOperatorToAirtableOperator(operator, value)} ${this.valueForOperator(value, operator)}`
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
           return[{
               filterExpr: `REGEX_MATCH({${fieldName}},'${this.valueForStringOperator(operator, value)}')` }]
        }

        if (operator === urlized) {
            console.error('not implemented')
        }
        return []
    }

    multipleFieldOperatorToFilterExpr(operator, values) {
        return `${operator}(${values.map(r => r[0]?.filterExpr).join(',')})`
    }

    valueForStringOperator(operator, value) {
        switch (operator) {
            case string_contains:
                return value
            case string_begins:
                return `^${value}`
            case string_ends:
                return `${value}$`
        }
    }

    valueForOperator(value, operator) {
        if (operator === include) {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return this.multipleFieldOperatorToFilterExpr('OR', value)
        }
        else if (operator === eq && value === undefined) {
            return '""'
        }

        return `"${value}"`
    }

    isSingleFieldOperator(operator) {
        return [ne, lt, lte, gt, gte, include, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    adapterOperatorToAirtableOperator(operator) {
        switch (operator) {
            case eq:
                return '='
            case ne:
                return '!='
            case lt:
                return '<'
            case lte:
                return '<='
            case gt:
                return '>'
            case gte:
                return '>='
        }
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EmptySort
        }

        const results=  sort.flatMap(this.parseSort)
        if (results.length === 0) {
            return EmptySort
        }
        return {
            sort: results
        }
    }


    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'asc' : 'desc'

        return { field: fieldName, direction: dir }

    }

    selectFieldsFor(projection) {
        return projection
    }

}

module.exports = FilterParser