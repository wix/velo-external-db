const { asWixData } = require('../converters/transform')
const { AdapterOperators } = require('velo-external-db-commons')


class DataService {
    constructor(storage, schemaInformation, filterTransformer, aggregationTransformer, queryValidator) {
        this.storage = storage
        this.schemaInformation = schemaInformation
        this.filterTransformer = filterTransformer
        this.aggregationTransformer = aggregationTransformer 
        this.queryValidator = queryValidator
    }

    async find(collectionName, _filter, sort, skip, limit) {
        const items = await this.storage.find(collectionName, _filter, sort, skip, limit)
        const totalCount = await this.storage.count(collectionName, _filter)
        return {
            items: items.map( asWixData ),
            totalCount
        }
    }

    async getById(collectionName, itemId) {
        const filter = {
            fieldName: '_id',
            operator: AdapterOperators.eq,
            value: itemId
        }
        const item = await this.storage.find(collectionName, filter, '', 0, 1)
        
        return { item: asWixData(item[0]) }
        
    }

    async count(collectionName, _filter) {
        const c = await this.storage.count(collectionName, _filter)
        return { totalCount: c }
    }

    async insert(collectionName, item) {
        const resp = await this.bulkInsert(collectionName, [item])
        return { item: resp.items[0] }
    }

    async bulkInsert(collectionName, items) {
        await this.storage.insert(collectionName, items)
        return { items }
    }

    async update(collectionName, item) {
        const resp = await this.bulkUpdate(collectionName, [item])
        return { item: resp.items[0] }
    }

    async bulkUpdate(collectionName, items) {
        await this.storage.update(collectionName, items)
        return { items }
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

    async aggregate(collectionName, _filter, _aggregation) {
        return {
            items: (await this.storage.aggregate(collectionName, _filter, _aggregation))
                                      .map( asWixData ),
            totalCount: 0
        }
    }
}

module.exports = DataService