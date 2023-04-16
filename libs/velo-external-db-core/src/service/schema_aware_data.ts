import { AdapterAggregation as Aggregation, AdapterFilter as Filter, AnyFixMe, Item, ItemWithId, ResponseField } from '@wix-velo/velo-external-db-types'
import QueryValidator from '../converters/query_validator'
import DataService from './data'
import CacheableSchemaInformation from './schema_information'

export default class SchemaAwareDataService {
    queryValidator: QueryValidator
    schemaInformation: CacheableSchemaInformation
    dataService: DataService
    itemTransformer: any
    constructor(dataService: any, queryValidator: any, schemaInformation: any, itemTransformer: any) {
        this.queryValidator = queryValidator
        this.schemaInformation = schemaInformation
        this.dataService = dataService
        this.itemTransformer = itemTransformer
    }

    async find(collectionName: string, filter: Filter, sort: any, skip: number, limit: number, _projection?: any): Promise<{ items: ItemWithId[], totalCount: number }> {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        await this.validateFilter(collectionName, filter, fields)
        const projection = await this.projectionFor(collectionName, _projection)
        await this.validateProjection(collectionName, projection, fields)

        const { items, totalCount } = await this.dataService.find(collectionName, filter, sort, skip, limit, projection)
        return { items: this.itemTransformer.patchItems(items, fields), totalCount }
    }

    async getById(collectionName: string, itemId: string, _projection?: any) {
        await this.validateGetById(collectionName, itemId)
        const projection = await this.projectionFor(collectionName, _projection)
        this.validateProjection(collectionName, projection)        
        
        return await this.dataService.getById(collectionName, itemId, projection)
    }

    async count(collectionName: string, filter: Filter) {
        await this.validateFilter(collectionName, filter)
        return await this.dataService.count(collectionName, filter)
    }
    
    async insert(collectionName: string, item: Item) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = await this.prepareItemsForInsert(fields, [item])
        return await this.dataService.insert(collectionName, prepared[0], fields)
    }
    
    async bulkInsert(collectionName: string, items: Item[]) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = await this.prepareItemsForInsert(fields, items)
        return await this.dataService.bulkInsert(collectionName, prepared, fields)
    }
    
    async update(collectionName: string, item: Item) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = await this.prepareItemsForInsert(fields, [item])
        return await this.dataService.update(collectionName, prepared[0])
    }

    async bulkUpdate(collectionName: string, items: Item[]) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const prepared = await this.prepareItemsForInsert(fields, items)
        return await this.dataService.bulkUpdate(collectionName, prepared)
    }

    async delete(collectionName: string, itemId: string) {
        return await this.dataService.delete(collectionName, itemId)
    }

    async bulkDelete(collectionName: string, itemIds: string[]) {
        return await this.dataService.bulkDelete(collectionName, itemIds)
    }

    async truncate(collectionName: string) {
        return await this.dataService.truncate(collectionName)
    }
    
    async aggregate(collectionName: string, filter: Filter, aggregation: Aggregation) {
        await this.validateAggregation(collectionName, aggregation)
        await this.validateFilter(collectionName, filter)
        return await this.dataService.aggregate(collectionName, filter, aggregation)
    }

    async validateFilter(collectionName: string, filter: Filter, _fields?: ResponseField[]) {
        const fields =  _fields ?? await this.schemaInformation.schemaFieldsFor(collectionName)
        this.queryValidator.validateFilter(fields, filter)
    }
    
    async validateGetById(collectionName: string, itemId: string) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        await this.queryValidator.validateGetById(fields, itemId)
    }

    async validateAggregation(collectionName: string, aggregation: Aggregation) {
        const fields = await this.schemaInformation.schemaFieldsFor(collectionName)
        this.queryValidator.validateAggregation(fields, aggregation)
    }

    async validateProjection(collectionName: string, projection: AnyFixMe, fields?: AnyFixMe) {
        const schemaFields = fields ?? await this.schemaInformation.schemaFieldsFor(collectionName)
        this.queryValidator.validateProjection(schemaFields, projection)
    }

    async prepareItemsForInsert(fields: any, items: any[]): Promise<Item[]> {
        return this.itemTransformer.prepareItemsForInsert(items, fields)
    }

    async schemaFieldNamesFor(collectionName: string, _fields?: ResponseField[]) {
        const fields = _fields ?? await this.schemaInformation.schemaFieldsFor(collectionName)
        return fields.map((f: { field: any }) => f.field)
    }

    private async projectionFor(collectionName: string, _projection?: string[]) {
        const schemaFields = await this.schemaInformation.schemaFieldsFor(collectionName)
        const schemaContainsId = schemaFields.some(f => f.field === '_id')
        const projection = _projection ?? schemaFields.map(f => f.field) 
        return schemaContainsId ? Array.from(new Set(['_id', ...projection])) : projection
    }
}
