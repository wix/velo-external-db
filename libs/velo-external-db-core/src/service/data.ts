import { NonEmptyAdapterAggregation as Aggregation, AdapterFilter as Filter, IDataProvider, Item, ResponseField, Sort } from '@wix-velo/velo-external-db-types'
import { asWixData, asWixDataItem } from '../converters/data_utils'
import { getByIdFilterFor } from '../utils/data_utils'
import {  errors as domainErrors } from '@wix-velo/velo-external-db-commons'
import { domainToSpiErrorObjectTranslator } from '../web/domain-to-spi-error-translator'

export default class DataService {
    storage: IDataProvider
    constructor(storage: any) {
        this.storage = storage
    }

    async find(collectionName: string, _filter: Filter, sort: any, skip: any, limit: any, projection: any, returnTotalCount?: boolean): Promise<{items: any[], totalCount?: number}> {
        const items = this.storage.find(collectionName, _filter, sort, skip, limit, projection)
        const totalCount = returnTotalCount? this.storage.count(collectionName, _filter) : undefined

        return {
            items: (await items).map(asWixData),
            totalCount: await totalCount
        }     
    }

    async getById(collectionName: string, itemId: string, projection: any) {
        const item = await this.storage.find(collectionName, getByIdFilterFor(itemId), '', 0, 1, projection)
        return item[0] ? asWixDataItem(item[0]) : { item: null }
    }

    async count(collectionName: string, filter: Filter) {
        const c = await this.storage.count(collectionName, filter)
        return { totalCount: c }
    }

    async insert(collectionName: string, item: Item, fields?: ResponseField[]) {
        const resp = await this.bulkInsert(collectionName, [item], fields)
        return resp.items[0]
    }

    async bulkUpsert(collectionName: string, items: Item[], fields?: ResponseField[]) {
        await this.storage.insert(collectionName, items, fields, true)
        return { items: items.map( asWixDataItem ) }
    }

    async bulkInsert(collectionName: string, _items: Item[], fields?: ResponseField[]) {
        const items = await Promise.all((_items.map( item => this.storage.insert(collectionName, [item], fields)
                                                                          .then(_i => asWixDataItem(item))
                                                                          .catch(e => domainToSpiErrorObjectTranslator(e)))
                                          ))
        
        return { items }
    }

    async update(collectionName: string, item: Item) {
        const resp = await this.bulkUpdate(collectionName, [item])
        return resp.items[0]
    }

    async bulkUpdate(collectionName: string, _items: Item[]) {
        const items = await Promise.all((_items.map( item => this.storage.update(collectionName, [item])
                                                                          // maybe we should throw from data provider if affectedRows equals to 0
                                                                          .then(affectedRows => affectedRows === 1 ? asWixDataItem(item) : Promise.reject(new domainErrors.ItemDoesNotExists(`Item doesn't exists: ${item._id}`, collectionName, item._id)))
                                                                          .catch(e => domainToSpiErrorObjectTranslator(e)))
                                         ))
                                         
        return { items }
    }

    async delete(collectionName: string, itemId: string, fields: any) {
        const { items } = await this.bulkDelete(collectionName, [itemId], fields)
        return items[0]
    }

    async bulkDelete(collectionName: string, itemIds: string[], fields: any) {
        const items = await Promise.all(itemIds.map(itemId => this.getById(collectionName, itemId, fields)
                                                                  .then(({ item }) => item ? asWixDataItem(item) : Promise.reject(new domainErrors.ItemDoesNotExists(`Item doesn't exists: ${itemId}`, collectionName, itemId)))
                                                                  .catch(e => domainToSpiErrorObjectTranslator(e))
                                        ))
        

        await this.storage.delete(collectionName, itemIds)
        return { items }
    }

    async truncate(collectionName: string) {
        return this.storage.truncate(collectionName)
    }


    // sort, skip, limit are not really optional, after we'll implement in all the data providers we can remove the ?
    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation, sort?: Sort[], skip?: number, limit?: number, returnTotalCount?: boolean) {
        const totalCount = returnTotalCount ? this.storage.count(collectionName, filter) : undefined
        return {
            items: ((await this.storage.aggregate?.(collectionName, filter, aggregation, sort, skip, limit)) || []).map(asWixData),
            totalCount: await totalCount
        }
    }
}
