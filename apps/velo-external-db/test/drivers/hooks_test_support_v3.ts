import { collectionSpi, ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { Item } from '@wix-velo/velo-external-db-types'


export const requestBodyWith = (collectionId: string, items: Item[]) => ({
    ...writeRequestBodyWith(collectionId, items), ...readRequestBodyWith(collectionId)
})

export const writeRequestBodyWith = (collectionId: string, items: Item[]) => ({
    collectionId, items, item: items[0], itemId: items[0]?._id, itemIds: items.map((item: { _id: any }) => item._id), overWriteExisting: true
})

export const readRequestBodyWith = (collectionId: string) => ({
    collectionId, filter: {}, query: { filter: {} }, omitTotalCount: false, group: { by: [], aggregation: [] }, initialFilter: {}, finalFilter: {}, sort: [], paging: { offset: 0, limit: 10 }
})

export const collectionWriteRequestBodyWith = (collection: collectionSpi.Collection) => ({
    collection, collectionId: collection.id, collectionIds: [collection.id]
})

export const splitIdToThreeParts = (id: string) => {
    return [id.slice(0, id.length / 3), id.slice(id.length / 3, id.length / 3 * 2), id.slice(id.length / 3 * 2)]
}

export const concatToProperty = <T>(obj: T, path: string, value: any): T => {
    const pathArray = path.split('.')
    const newObject = { ...obj }
    let current = newObject
  
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]]
    }
  
    current[pathArray[pathArray.length - 1]] += value
    return newObject
  }

export const resetHooks = (externalDbRouter: ExternalDbRouter) => externalDbRouter.reloadHooks()
