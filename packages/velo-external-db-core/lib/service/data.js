const { asWixData, unpackDates, generateIdsIfNeeded } = require('./transform')

class DataService {
    constructor(storage) {
        this.storage = storage
    }

    async find(collectionName, filter, sort, skip, limit) {
        const items = await this.storage.find(collectionName, filter, sort, skip, limit)
        return {
            items: items.map( asWixData ),
            totalCount: items.length
        }
    }

    async getById(collectionName, itemId) {
        const result = await this.find(collectionName, {
            kind: 'filter',
            operator: '$eq',
            fieldName: '_id',
            value: itemId
        }, '', 0, 1)

        return { item: result.items[0] }
    }

    async count(collectionName, filter) {
        const c = await this.storage.count(collectionName, filter)
        return { totalCount: c }
    }

    async insert(collectionName, item) {
        const resp = await this.bulkInsert(collectionName, [item])
        return { item: resp.items[0] }
    }

    async bulkInsert(collectionName, items) {
        const itemsWithIds = items.map(i => generateIdsIfNeeded(i))
        await this.storage.insert(collectionName, itemsWithIds.map(i => unpackDates(i)))
        return { items: itemsWithIds }
    }

    async update(collectionName, item) {
        const resp = await this.bulkUpdate(collectionName, [item])
        return { item: resp.items[0] }
    }

    async bulkUpdate(collectionName, items) {
        await this.storage.update(collectionName, items.map(i => unpackDates(i)))
        return { items: items }
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