const { asWixData } = require('../converters/data_utils')
const { getByIdFilterFor } = require ('../utils/data_utils')

class DataService {
    constructor(storage) {
        this.storage = storage
    }

    async find(collectionName, _filter, sort, skip, limit, projection) {
        const items = this.storage.find(collectionName, _filter, sort, skip, limit, projection) //todo: change order when all implementation support projection
        const totalCount = this.storage.count(collectionName, _filter)
        return {
            items: (await items).map( asWixData ),
            totalCount: await totalCount
        }
    }

    async getById(collectionName, itemId, projection) {
        const item = await this.storage.find(collectionName, getByIdFilterFor(itemId), '', 0, 1, projection)
        
        return { item: asWixData(item[0]) }
    }

    async count(collectionName, filter) {
        const c = await this.storage.count(collectionName, filter)
        return { totalCount: c }
    }

    async insert(collectionName, item, fields) {
        const resp = await this.bulkInsert(collectionName, [item], fields)
        return { item: asWixData(resp.items[0]) }
    }

    async bulkInsert(collectionName, items, fields) {
        await this.storage.insert(collectionName, items, fields)
        return { items: items.map( asWixData ) }
    }

    async update(collectionName, item) {
        const resp = await this.bulkUpdate(collectionName, [item])
        return { item: asWixData(resp.items[0]) }
    }

    async bulkUpdate(collectionName, items) {
        await this.storage.update(collectionName, items)
        return { items: items.map( asWixData ) }
    }

    async delete(collectionName, itemId) {
        await this.bulkDelete(collectionName, [itemId])
        return { item: {} }
    }

    async bulkDelete(collectionName, itemIds) {
        await this.storage.delete(collectionName, itemIds)
        return { items: [] }
    }

    async truncate(collectionName) {
        return this.storage.truncate(collectionName)
    }

    async aggregate(collectionName, filter, aggregation) {
        return {
            items: (await this.storage.aggregate(collectionName, filter, aggregation))
                                      .map( asWixData ),
            totalCount: 0
        }
    }
}

module.exports = DataService