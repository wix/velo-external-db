import { AdapterFunctions } from '@wix-velo/velo-external-db-types'

export const EmptyFilter = {}

export const projectionFieldFor = (fieldName: any, fieldAlias?: string) => {
    const field = { name: fieldName.substring(1) }
    return fieldAlias ? { ...field, ...{ alias: fieldAlias } } : field
}

export const projectionFunctionFor = (fieldName: string | number, fieldAlias: any, func: any) => {
    if (func === AdapterFunctions.count)
        return { alias: fieldAlias, function: AdapterFunctions.count, name: '*' }
    
    return { name: fieldName as string, alias: fieldAlias || fieldName as string, function: func }
}
