import { isObject } from '@wix-velo/velo-external-db-commons'
import { AdapterAggregation, AdapterFunctions, FieldProjection, FunctionProjection, WixDataAggregation } from '@wix-velo/velo-external-db-types'
import { IFilterTransformer } from './filter_transformer'
import { projectionFieldFor, projectionFunctionFor } from './utils'
import { errors } from '@wix-velo/velo-external-db-commons'
const { InvalidQuery } = errors

interface IAggregationTransformer {
    transform(aggregation: any): AdapterAggregation
    extractProjectionFunctions(functionsObj: { [x: string]: { [s: string]: string | number } }): FunctionProjection[]
    extractProjectionFields(fields: { [fieldName: string]: string } | string): FieldProjection[]
    wixFunctionToAdapterFunction(wixFunction: string): AdapterFunctions
}

export default class AggregationTransformer implements IAggregationTransformer{
    filterTransformer: IFilterTransformer
    constructor(filterTransformer: any) {
        this.filterTransformer = filterTransformer
    }

    transform({ processingStep, postFilteringStep }: WixDataAggregation): AdapterAggregation {        
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

    extractProjectionFunctions(functionsObj: { [x: string]: { [s: string]: string | number } }) {
        const projectionFunctions: { name: any; alias: any; function: any }[] = []
        Object.keys(functionsObj)
              .forEach(fieldAlias => {
                  Object.entries(functionsObj[fieldAlias])
                        .forEach(([func, field]) => {
                            projectionFunctions.push(projectionFunctionFor(field, fieldAlias, this.wixFunctionToAdapterFunction(func)))
                        })
                })

        return projectionFunctions
    }

    extractProjectionFields(fields: { [fieldName: string]: string } | string) {
        const projectionFields = []

        if (isObject(fields)) {
            projectionFields.push(...Object.values(fields).map(f => projectionFieldFor(f)) )
        } else {
            projectionFields.push(projectionFieldFor(fields))
        }
        
        return projectionFields
    }

    wixFunctionToAdapterFunction(func: string): AdapterFunctions {
        return this.wixFunctionToAdapterFunctionString(func) as AdapterFunctions
    }

    private wixFunctionToAdapterFunctionString(func: string): string {
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
