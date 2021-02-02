const { asWixData, unpackDates } = require('./transform')

class DataService {
    constructor(storage) {
        this.storage = storage
    }

    async find(collectionName, filter, sort, skip, limit) {
        return {
            items: (await this.storage.find(collectionName, filter, sort, skip, limit))
                                      .map( asWixData ),
            totalCount: 0
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
        await this.storage.insert(collectionName, unpackDates(item))
        return { item: item }
    }

    async update(collectionName, item) {
        await this.storage.update(collectionName, unpackDates(item))
        return { item: item }
    }

    async delete(collectionName, itemIds) {
        return this.storage.delete(collectionName, itemIds)
    }
}

module.exports = DataService