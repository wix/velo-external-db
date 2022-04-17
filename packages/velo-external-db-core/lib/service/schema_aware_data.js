
class SchemaAwareDataService {
    constructor(dataService, queryValidator, schemaInformation, itemTransformer) {
        this.queryValidator = queryValidator
        this.schemaInformation = schemaInformation
        this.dataService = dataService
        this.itemTransformer = itemTransformer
    }

    async find(collectionName, filter, sort, skip, limit) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        await this.validateFilter(collectionName, filter, fields)
        const projection = await this.schemaFieldNamesFor(collectionName, fields)

        const { items, totalCount } = await this.dataService.find(collectionName, filter, sort, skip, limit, projection)
        return { items: this.itemTransformer.patchItems(items, fields), totalCount }
    }

    async getById(collectionName, itemId) {
        await this.validateGetById(collectionName, itemId)
        const projection = await this.schemaFieldNamesFor(collectionName)
        
        return await this.dataService.getById(collectionName, itemId, projection)
    }

    async count(collectionName, filter) {
        await this.validateFilter(collectionName, filter)
        return await this.dataService.count(collectionName, filter)
    }
    
    async insert(collectionName, item) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = await this.prepareItemsForInsert(fields, [item])
        return await this.dataService.insert(collectionName, prepared[0], fields)
    }
    
    async bulkInsert(collectionName, items) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = await this.prepareItemsForInsert(fields, items)
        return await this.dataService.bulkInsert(collectionName, prepared, fields)
    }
    
    async update(collectionName, item) {
        const prepared = await this.prepareItemsForUpdate(collectionName, [item])
        return await this.dataService.update(collectionName, prepared[0])
    }

    async bulkUpdate(collectionName, items) {
        const prepared = await this.prepareItemsForUpdate(collectionName, items)
        return await this.dataService.bulkUpdate(collectionName, prepared)
    }

    async delete(collectionName, itemId) {
        return await this.dataService.delete(collectionName, itemId)
    }

    async bulkDelete(collectionName, itemIds) {
        return await this.dataService.bulkDelete(collectionName, itemIds)
    }

    async truncate(collectionName) {
        return await this.dataService.truncate(collectionName)
    }
    
    async aggregate(collectionName, filter, aggregation) {
        await this.validateAggregation(collectionName, aggregation)
        await this.validateFilter(collectionName, filter)
        return await this.dataService.aggregate(collectionName, filter, aggregation)
    }

    async validateFilter(collectionName, filter, _fields) {
        const fields =  _fields ?? await this.schemaInformation.schemaFieldsFor(collectionName)
        this.queryValidator.validateFilter(fields, filter)
    }
    
    async validateGetById(collectionName, itemId) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        await this.queryValidator.validateGetById(fields, itemId)
    }

    async validateAggregation(collectionName, aggregation) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        this.queryValidator.validateAggregation(fields, aggregation)
    }

    async prepareItemsForUpdate(collectionName, items) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)

        return this.itemTransformer.prepareItemsForUpdate(items, fields)
    }
    
    async prepareItemsForInsert(fields, items) {
        return this.itemTransformer.prepareItemsForInsert(items, fields)
    }

    async schemaFieldNamesFor(collectionName, _fields) {
        const fields = _fields ?? await this.schemaInformation.schemaFieldsFor(collectionName)
        return fields.map(f => f.field)
    }

}

module.exports = SchemaAwareDataService