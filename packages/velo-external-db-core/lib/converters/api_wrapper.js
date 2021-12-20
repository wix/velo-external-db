const { isObject, isEmptyFilter } = require('velo-external-db-commons')
const { AdapterOperators, AdapterFunctions, EMPTY_FILTER, projectionFieldFor, projectionFunctionFor } = require ('./api_wrapper_utils')

//FilterService 
//ApiFilterService
//ApiFilterWrapper
class ApiWrapper {
    constructor() {}

    parseAggregation(processingStep, postFilteringStep) {
        const projection = []
        
        if (isObject(processingStep._id)) {
            projection.push(...Object.values(processingStep._id).map(f => projectionFieldFor(f)) )
        } else {
            projection.push(projectionFieldFor(processingStep._id))
        }

        Object.keys(processingStep)
              .filter(f => f !== '_id')
              .forEach(fieldAlias => {
                  Object.entries(processingStep[fieldAlias])
                        .forEach(([func, field]) => {
                            projection.push(projectionFunctionFor(field, fieldAlias, this.wixFunctionToAdapterFunction(func)))
                        })
              })

        const postFilter = this.parseFilter(postFilteringStep)

        return {
            projection,
            postFilter
        }
    }

    
    parseFilter(filter) {
        if (isEmptyFilter(filter)) return EMPTY_FILTER

        if(this.isMultipleFieldOperator(filter)) {
            const wixOperator = Object.keys(filter)[0]
            const operator = this.wixOperatorToAdapterOperator(wixOperator)
            const values = filter[wixOperator]
            const res = values.map(this.parseFilter.bind(this))
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
                return AdapterOperators.in
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
        }
    }

    wixFunctionToAdapterFunction(func) {
        switch (func) {
            case '$avg':
                return AdapterFunctions.avg
            case '$max':
                return AdapterFunctions.max
            case '$min':
                return AdapterFunctions.min
            case '$sum':
                return AdapterFunctions.sum
            //COUNT!
        }
    }

    
}



module.exports = ApiWrapper