import { AdapterAggregation, AdapterFunctions } from '@wix-velo/velo-external-db-types'
import { IFilterTransformer } from './filter_transformer'
import { projectionFunctionFor } from './utils'
import { errors } from '@wix-velo/velo-external-db-commons'
import { Aggregation, Group } from '../spi-model/data_source'
const { InvalidQuery } = errors

interface IAggregationTransformer {
    transform(aggregation: { group: Group, finalFilter?: any }): AdapterAggregation
    wixFunctionToAdapterFunction(wixFunction: string): AdapterFunctions
}

export default class AggregationTransformer implements IAggregationTransformer {
    filterTransformer: IFilterTransformer
    constructor(filterTransformer: any) {
        this.filterTransformer = filterTransformer
    }

    transform({ group, finalFilter }: { group: Group, finalFilter?: any }): AdapterAggregation {        
        const { by: fields, aggregation } = group

        const projectionFields = fields.map(f => ({ name: f }))
        const projectionFunctions = this.aggregationToProjectionFunctions(aggregation)
        
        const postFilter = this.filterTransformer.transform(finalFilter)

        const projection = [...projectionFields, ...projectionFunctions]

        return {
            projection,
            postFilter
        }
    }

    aggregationToProjectionFunctions(aggregations: Aggregation[]) {
        return aggregations.map(aggregation => {
            const { name: fieldAlias, ...rest } = aggregation
            const [func, field] = Object.entries(rest)[0]
            return projectionFunctionFor(field, fieldAlias, this.wixFunctionToAdapterFunction(func))
        })
    }

    wixFunctionToAdapterFunction(func: string): AdapterFunctions {
        if (Object.values(AdapterFunctions).includes(func as any)) {
            return AdapterFunctions[func as AdapterFunctions] as AdapterFunctions
        }

        throw new InvalidQuery(`Unrecognized function ${func}`)
    }
}
