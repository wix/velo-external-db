const { isObject, AdapterFunctions } = require('velo-external-db-commons')
const { projectionFieldFor, projectionFunctionFor } = require ('./utils')
const { InvalidQuery } = require('velo-external-db-commons').errors

class AggregationTransformer {
    constructor(filterTransformer) {
        this.filterTransformer = filterTransformer
    }

    transform({ processingStep, postFilteringStep }) {        
        const { _id: fields, ...functions } = processingStep

        const projectionFields = this.extractProjectionFields(fields)
        const projectionFunctions = this.extractProjectionFunctions(functions)

        const postFilter = this.filterTransformer.transform(postFilteringStep)

        const projection = [...projectionFields, ...projectionFunctions]

        return {
            projection,
            postFilter
        }
    }

    extractProjectionFunctions(functionsObj) {
        const projectionFunctions = []
        Object.keys(functionsObj)
              .forEach(fieldAlias => {
                  Object.entries(functionsObj[fieldAlias])
                        .forEach(([func, field]) => {
                            projectionFunctions.push(projectionFunctionFor(field, fieldAlias, this.wixFunctionToAdapterFunction(func)))
                        })
                })

        return projectionFunctions
    }

    extractProjectionFields(fields) {
        const projectionFields = []

        if (isObject(fields)) {
            projectionFields.push(...Object.values(fields).map(f => projectionFieldFor(f)) )
        } else {
            projectionFields.push(projectionFieldFor(fields))
        }
        
        return projectionFields
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
            
            default:
                throw new InvalidQuery(`Unrecognized function ${func}`)
        }
    }
}

module.exports= AggregationTransformer