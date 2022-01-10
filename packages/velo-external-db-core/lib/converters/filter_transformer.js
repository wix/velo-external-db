const { AdapterOperators, isObject } = require('velo-external-db-commons')
const { EMPTY_FILTER } = require ('./utils')
const { InvalidQuery } = require('velo-external-db-commons').errors

class FilterTransformer {
    constructor() {

    }

    transform(filter) {
        if (this.isEmptyFilter(filter)) return EMPTY_FILTER

        if(this.isMultipleFieldOperator(filter)) {
            const wixOperator = Object.keys(filter)[0]
            const operator = this.wixOperatorToAdapterOperator(wixOperator)
            const values = filter[wixOperator]
            const res = values.map(this.transform.bind(this))
            return {
                operator,
                value: res
            }
        }

        const fieldName = Object.keys(filter)[0]
        const wixOperator = Object.keys(filter[fieldName])[0]
        const operator = this.wixOperatorToAdapterOperator(wixOperator)
        const value = filter[fieldName][wixOperator]
        return {
            operator,
            fieldName,
            value
        }
    }


    isMultipleFieldOperator(filter) { 
        return ['$not', '$or', '$and'].includes(Object.keys(filter)[0])
    }


    wixOperatorToAdapterOperator(operator) {
        switch (operator) {
            case '$eq':
                return AdapterOperators.eq
            case '$ne':
                return AdapterOperators.ne
            case '$lt':
                return AdapterOperators.lt
            case '$lte':
                return AdapterOperators.lte
            case '$gt': 
                return AdapterOperators.gt
            case '$gte':
                return AdapterOperators.gte
            case '$hasSome':
                return AdapterOperators.include
            case '$contains':
                return AdapterOperators.string_contains
            case '$startsWith':
                return AdapterOperators.string_begins
            case '$endsWith':
                return AdapterOperators.string_ends
            case '$or':
                return AdapterOperators.or
            case '$and':
                return AdapterOperators.and
            case '$not':
                return AdapterOperators.not
            case '$urlized':
                return AdapterOperators.urlized
                
            default:
                throw new InvalidQuery(`Unrecognized operator ${operator}`)
        }
    }

    isEmptyFilter(filter) {
        return (!filter || !isObject(filter)|| Object.keys(filter)[0] === undefined)
    } 
    
}

module.exports = FilterTransformer