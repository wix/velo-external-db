import { SchemaOperations } from '@wix-velo/velo-external-db-commons'
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { InputField, Item, WixDataFilter } from '@wix-velo/velo-external-db-types'
const { Aggregate } = SchemaOperations

export const resetHooks = (externalDbRouter: ExternalDbRouter) => externalDbRouter.reloadHooks()

export const writeRequestBodyWith = (collectionName: string, items: Item[]) => ({
    collectionName, items, item: items[0], itemId: items[0]._id, itemIds: items.map((item: { _id: any }) => item._id)
})

export const readRequestBodyWith = (collectionName: string, items: Item[]) => ({
    collectionName, filter: {}, processingStep: { _id: { field1: '$_id' } }, postFilteringStep: {}, itemId: items[0]._id, skip: 0, limit: 10
})

export const findRequestBodyWith = (collectionName: string, filter: WixDataFilter) => ({
    collectionName, filter, skip: 0, limit: 10, sort: { _id: 1 }
})

export const getRequestBodyWith = (collectionName: string, itemId: string) => ({
    collectionName, itemId
})

export const aggregateRequestBodyWith = (collectionName: string, filter: WixDataFilter) => ({
    collectionName, filter, processingStep: { _id: { field1: '$_id' } }, postFilteringStep: {}
})

export const skipAggregationIfNotSupported = (hookName: string, supportedOperations: string[]) => {
    return (hookName.includes('Aggregate') && !supportedOperations.includes(Aggregate))
}


export const writeSchemaRequestBodyWith = (collectionName: string, columnToRemove: InputField, columnToCreate: InputField) => ({
    collectionName, column: columnToCreate, columnName: columnToRemove.name
})

export const readSchemaRequestBodyWith = (collectionName: string) => ({
    schemaIds: [collectionName]
})
