import { EmptyAggregation, AdapterFunctions, AdapterAggregation } from '@wix-velo/velo-external-db-types'
import { IFilterTransformer } from './filter_transformer'
import { projectionFunctionFor } from './utils'
import { errors } from '@wix-velo/velo-external-db-commons'
import { Operation, Aggregation, Filter } from '../spi-model/data_source'
const { InvalidQuery } = errors

type TransformAggregationParams = {
    aggregation?: Aggregation
    finalFilter?: Filter
}

interface IAggregationTransformer {
    transform(aggregation: TransformAggregationParams): AdapterAggregation 
    wixFunctionToAdapterFunction(wixFunction: string): AdapterFunctions
}

export default class AggregationTransformer implements IAggregationTransformer {
    filterTransformer: IFilterTransformer
    constructor(filterTransformer: any) {
        this.filterTransformer = filterTransformer
    }

    transform({ aggregation, finalFilter }: TransformAggregationParams): AdapterAggregation {        
        if (!aggregation) {
            return {} as EmptyAggregation
        }
        
        const { groupingFields: fields, operations } = aggregation

        const projectionFields = fields.map(f => ({ name: f }))
        const projectionFunctions = this.operationToProjectionFunctions(operations)
        
        const postFilter = this.filterTransformer.transform(finalFilter)

        const projection = [...projectionFields, ...projectionFunctions]

        return {
            projection,
            postFilter
        }
    }

    operationToProjectionFunctions(operations: Operation[]) {
        /*
            Operations item looks like this: { resultFieldName: 'myAvg', average: { itemFieldName: 'myFieldName' } }
            So after extraction the variables are as follows: resultFieldName(alias): MyAvg, func: average, fieldName: myFieldName
        */
        return operations.map(operation => {
            const { resultFieldName, ...calculate } = operation
            const [func, fieldNameItem] = Object.entries(calculate)[0]
            const field = fieldNameItem.itemFieldName        
            return projectionFunctionFor(field, resultFieldName, this.wixFunctionToAdapterFunction(func))
        })
    }

    wixFunctionToAdapterFunction(func: string): AdapterFunctions {
        switch (func) {
            case 'average':
                return AdapterFunctions.avg
            case 'max':
                return AdapterFunctions.max
            case 'min':
                return AdapterFunctions.min
            case 'sum':
                return AdapterFunctions.sum
            case 'count':
                return AdapterFunctions.count
            default:
                throw new InvalidQuery(`Unrecognized function ${func}`)
        }

    }
}
