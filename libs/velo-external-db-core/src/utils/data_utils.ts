import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter, AdapterOperator } from '@wix-velo/velo-external-db-types'

export const getByIdFilterFor = (itemId: string): AdapterFilter => ({
    fieldName: '_id',
    operator: AdapterOperators.eq as AdapterOperator,
    value: itemId    
})
