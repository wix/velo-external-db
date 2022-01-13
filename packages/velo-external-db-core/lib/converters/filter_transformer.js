const { isObject, wixOperatorToAdapterOperator } = require('velo-external-db-commons')
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


    wixOperatorToAdapterOperator(wixOperator) {
        const adapterOperator = wixOperatorToAdapterOperator(wixOperator)

        if( adapterOperator === undefined) {
            throw new InvalidQuery(`Unrecognized operator ${wixOperator}`)
        }

        return adapterOperator        
    }

    isEmptyFilter(filter) {
        return (!filter || !isObject(filter)|| Object.keys(filter)[0] === undefined)
    } 
    
}

module.exports = FilterTransformer