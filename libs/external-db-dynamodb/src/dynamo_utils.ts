import { errors } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField } from '@wix-velo/velo-external-db-types'
import { Counter } from './sql_filter_transformer'
const { InvalidQuery } = errors

export const SystemTable = '_descriptor'

export const EmptyFilter = { filterExpr: {} }

export const isSystemTable = (collectionId: string) => SystemTable === collectionId.trim().toLowerCase()

export const validateTable = (collection: string) => {
    if (collection && isSystemTable(collection) ) {
        throw new InvalidQuery('Illegal table name')
    }
}

export const patchFixDates = (record: { [x: string]: any }) => {
    const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}/
    const fixedRecord: {[x: string]: any} = {}
    Object.keys(record).map(key => {
        const value = record[key]
        if (dateRegex.test(value))
            fixedRecord[key] = new Date (value)
        else
            fixedRecord[key] = value
    })
    return fixedRecord
}


export const reformatFields = (field: InputField): ResponseField => {
    return {
        field: field.name,
        type: field.type,
    }
}

export const patchCollectionKeys = () => (['_id'])

export const canQuery = (filterExpr: { ExpressionAttributeNames: { [s: string]: unknown } | ArrayLike<unknown> }, collectionKeys: unknown[]) => {
    if (!filterExpr) return false

    const filterAttributes = Object.values(filterExpr.ExpressionAttributeNames) 
    return filterAttributes.every(v => collectionKeys.includes(v))
}

export const isEmptyObject = (obj: {}) => Object.keys(obj).length === 0

export const fieldNameWithCounter = (fieldName: string, counter: Counter) => `#${fieldName}${counter.nameCounter++}`
export const attributeValueNameWithCounter = (fieldName: any, counter: Counter) => `:${fieldName}${counter.valueCounter++}`