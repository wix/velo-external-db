const { asWixData, unpackDates, prepareForInsert, prepareForUpdate } = require('../converters/transform')
const { AdapterOperators } = require('velo-external-db-commons')
// const { validateQueryFields } = require ('./validate_query')

class DataService {
    constructor(storage, schemaInformation, filterTransformer, aggregationTransformer) {
        this.storage = storage
        this.schemaInformation = schemaInformation
        this.filterTransformer = filterTransformer
        this.aggregationTransformer = aggregationTransformer 
    }

    async find(collectionName, _filter, sort, skip, limit) {
        const filter = this.filterTransformer.transform(_filter)
        // const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        // validateQueryFields(fields, filter)

        const items = await this.storage.find(collectionName, filter, sort, skip, limit)
        return {
            items: items.map( asWixData ),
            totalCount: items.length
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
        const filter = this.filterTransformer.transform(_filter)
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
        const aggregation = this.aggregationTransformer.transform(_aggregation)
        const filter = this.filterTransformer.transform(_filter)
        return {
            items: (await this.storage.aggregate(collectionName, filter, aggregation))
                                      .map( asWixData ),
            totalCount: 0
        }
    }
}

module.exports = DataService