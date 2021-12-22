const { asWixData, unpackDates, prepareForInsert, prepareForUpdate, transformIfSupported } = require('../converters/transform')
const FilterTransformer = require ('../converters/filter_transformer')
const AggregationTransformer = require ('../converters/aggregation_transformer')

class DataService {
    constructor(storage, schemaInformation, supportAdapterFormat) {
        this.storage = storage
        this.schemaInformation = schemaInformation
        this.filterTransformer = supportAdapterFormat ? new FilterTransformer() : false
        this.aggregationTransformer = supportAdapterFormat ? new AggregationTransformer(this.filterTransformer): false
    }

    async find(collectionName, _filter, sort, skip, limit) {
        const filter = transformIfSupported(_filter, this.filterTransformer)
        const items = await this.storage.find(collectionName, filter, sort, skip, limit)
        return {
            items: items.map( asWixData ),
            totalCount: items.length
        }
    }

    async getById(collectionName, itemId) {
        const result = await this.find(collectionName, {
            _id: { $eq: itemId }
        }, '', 0, 1)

        return { item: result.items[0] }
    }

    async count(collectionName, _filter) {
        const filter = transformIfSupported(_filter, this.filterTransformer)
        const c = await this.storage.count(collectionName, filter)
        return { totalCount: c }
    }

    async insert(collectionName, item) {
        const resp = await this.bulkInsert(collectionName, [item])
        return { item: resp.items[0] }
    }

    async bulkInsert(collectionName, items) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = items.map(i => prepareForInsert(i, fields))
        await this.storage.insert(collectionName, prepared.map(i => unpackDates(i)), fields)
        return { items: prepared }
    }

    async update(collectionName, item) {
        const resp = await this.bulkUpdate(collectionName, [item])
        return { item: resp.items[0] }
    }

    async bulkUpdate(collectionName, items) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = items.map(i => prepareForUpdate(i, fields))
        await this.storage.update(collectionName, prepared.map(i => unpackDates(i)), fields)
        return { items: prepared }
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
        const aggregation = transformIfSupported(_aggregation, this.aggregationTransformer)
        const filter = transformIfSupported(_filter, this.filterTransformer)
        return {
            items: (await this.storage.aggregate(collectionName, filter, aggregation))
                                      .map( asWixData ),
            totalCount: 0
        }
    }
}

module.exports = DataService