import { AdapterAggregation as Aggregation, AdapterFilter as Filter, IDataProvider, InputField, Item, ItemWithId, ResponseField } from '@wix-velo/velo-external-db-types'
import { asWixData } from '../converters/data_utils'
import { getByIdFilterFor } from '../utils/data_utils'

export interface IDataService {
    find(collectionName: string, filter: Filter, sort: any, skip: any, limit: any, projection: any): Promise<{ items: ItemWithId[], totalCount: number }>
    getById(collectionName: string, itemId: string, projection: any): Promise<{ item: ItemWithId }>
    count(collectionName: string, filter: Filter): Promise<{ totalCount: number }>
    insert(collectionName: string, item: Item, fields: ResponseField[]): Promise<{ item: ItemWithId }>
    bulkInsert(collectionName: string, items: Item[], fields: ResponseField[]): Promise<{ items: ItemWithId[] }>
    update(collectionName: string, item: Item): Promise<{ item: ItemWithId }>
    bulkUpdate(collectionName: string, items: Item[]): Promise<{ items: ItemWithId[] }>
    delete(collectionName: string, itemId: string): Promise<{ item: {} }>
    bulkDelete(collectionName: string, itemIds: string[]): Promise<{ items: never[] }>
    truncate(collectionName: string): Promise<void>
    aggregate(collectionName: string, filter: Filter, aggregation: Aggregation): Promise<{ items: ItemWithId[], totalCount: number }>
}


export default class DataService implements IDataService {
    storage: IDataProvider
    constructor(storage: any) {
        this.storage = storage
    }

    async find(collectionName: string, _filter: Filter, sort: any, skip: any, limit: any, projection: any) {
        const items = this.storage.find(collectionName, _filter, sort, skip, limit, projection)
        const totalCount = this.storage.count(collectionName, _filter)
        return {
            items: (await items).map( asWixData ),
            totalCount: await totalCount
        }
    }

    async getById(collectionName: string, itemId: string, projection: any) {
        const item = await this.storage.find(collectionName, getByIdFilterFor(itemId), '', 0, 1, projection)
        
        return { item: asWixData(item[0]) }
    }

    async count(collectionName: string, filter: Filter) {
        const c = await this.storage.count(collectionName, filter)
        return { totalCount: c }
    }

    async insert(collectionName: string, item: Item, fields: ResponseField[]) {
        const resp = await this.bulkInsert(collectionName, [item], fields)
        return { item: asWixData(resp.items[0]) }
    }

    async bulkInsert(collectionName: string, items: Item[], fields: ResponseField[]) {
        await this.storage.insert(collectionName, items, fields)
        return { items: items.map( asWixData ) }
    }

    async update(collectionName: string, item: Item) {
        const resp = await this.bulkUpdate(collectionName, [item])
        return { item: asWixData(resp.items[0]) }
    }

    async bulkUpdate(collectionName: string, items: Item[]) {
        await this.storage.update(collectionName, items)
        return { items: items.map( asWixData ) }
    }

    async delete(collectionName: string, itemId: string) {
        await this.bulkDelete(collectionName, [itemId])
        return { item: {} }
    }

    async bulkDelete(collectionName: string, itemIds: string[]) {
        await this.storage.delete(collectionName, itemIds)
        return { items: [] }
    }

    async truncate(collectionName: string) {
        return this.storage.truncate(collectionName)
    }

    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation) {
        return {
            items: (await this.storage.aggregate(collectionName, filter, aggregation))
                                      .map( asWixData ),
            totalCount: 0
        }
    }
}
