import { QueryOperatorsByFieldType } from '@wix-velo/velo-external-db-commons' 
import { AdapterFilter, AdapterOperator, NotEmptyAdapterFilter } from '@wix-velo/velo-external-db-types'
import FilterTransformer from '../converters/filter_transformer'
import { EmptyFilter } from '../converters/utils'
const WixOperatorToAdapterOperator = new FilterTransformer().wixOperatorToAdapterOperatorString

export const queryAdapterOperatorsFor = (type: string) => ( (QueryOperatorsByFieldType as any)[type].map((op: any) => WixOperatorToAdapterOperator(`$${op}`)) )

export const extractFieldsAndOperators = (_filter: AdapterFilter): { name: string, operator: AdapterOperator }[] => { 
    if (_filter === EmptyFilter) return []
    const filter = _filter as NotEmptyAdapterFilter
    if (filter.fieldName) return [{ name: filter.fieldName.split('.')[0], operator: filter.operator as AdapterOperator }]
    return filter.value.map((filter: any) =>  extractFieldsAndOperators(filter)).flat()
}

export const isBlank = (str: string) => (!str || /^\s*$/.test(str)) 
