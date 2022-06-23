import { AdapterFunctions } from '@wix-velo/velo-external-db-commons'

export const EmptyFilter = {}

export const projectionFieldFor = (fieldName: any, fieldAlias?: string) => {
    const field = { name: fieldName.substring(1) }
    return fieldAlias ? { ...field, ...{ alias: fieldAlias } } : field
}

export const projectionFunctionFor = (fieldName: string | number, fieldAlias: any, func: any) => {
    if (isCountFunc(func, fieldName))
        return { alias: fieldAlias, function: AdapterFunctions.count, name: '*' }
    const name = (fieldName as string).substring(1)
    return { name, alias: fieldAlias || name, function: func }
}

const isCountFunc = (func: any, value: any ) => (func === AdapterFunctions.sum && value === 1)
