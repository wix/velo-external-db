import { AdapterOperators } from '@wix-velo/velo-external-db-commons'

export const getByIdFilterFor = (itemId: string) => ({
    fieldName: '_id',
    operator: AdapterOperators.eq,
    value: itemId    
})
