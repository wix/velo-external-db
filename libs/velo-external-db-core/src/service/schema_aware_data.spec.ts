import SchemaAwareDataService from './schema_aware_data'
import * as schema from '../../test/drivers/schema_information_test_support'
import * as data from '../../test/drivers/data_service_test_support'
import * as queryValidator from '../../test/drivers/query_validator_test_support'
import * as patcher from '../../test/drivers/item_patcher_test_support'
import * as Chance from 'chance'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import { SystemFields } from '@wix-velo/velo-external-db-commons'
import DataService from './data'
const chance = new Chance()

describe ('Schema Aware Data Service', () => {
    
    test('find validate filter and call data service with projection fields', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        queryValidator.givenValidFilterForDefaultFieldsOf(ctx.transformedFilter) 
        queryValidator.givenValidProjectionForDefaultFieldsOf(SystemFields)
        data.givenListResult(ctx.entities, ctx.totalCount, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultFields)  
        patcher.givenPatchedBooleanFieldsWith(ctx.patchedEntities, ctx.entities)

        return expect(env.schemaAwareDataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)).resolves.toEqual({
                                                                                                                        items: ctx.patchedEntities,
                                                                                                                        totalCount: ctx.totalCount
                                                                                                                    })
    })

    test('count validate filter and call data service', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        queryValidator.givenValidFilterForDefaultFieldsOf(ctx.transformedFilter) 
        data.givenCountResult(ctx.totalCount, ctx.collectionName, ctx.filter)

        return expect(env.schemaAwareDataService.count(ctx.collectionName, ctx.filter)).resolves.toEqual({ totalCount: ctx.totalCount })
    })

    test('get by id call data service', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        queryValidator.givenValidGetByIdForDefaultFieldsFor(ctx.itemId)
        data.givenGetByIdResult(ctx.entity, ctx.collectionName, ctx.itemId, ctx.defaultFields)

        return expect(env.schemaAwareDataService.getById(ctx.collectionName, ctx.itemId)).resolves.toEqual({ item: ctx.entity })
    })

    test('insert will prepare item for insert and call data service with the prepared item', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        patcher.givenPreparedItemsForInsertWith([ctx.preparedEntity], [ctx.entityWithoutId])
        data.givenInsertResult(ctx.preparedEntity, ctx.collectionName)

        return expect(env.schemaAwareDataService.insert(ctx.collectionName, ctx.entityWithoutId)).resolves.toEqual({ item: ctx.preparedEntity })
    })

    test('bulk insert will prepare items for insert and call data service with the prepared items', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        patcher.givenPreparedItemsForInsertWith(ctx.preparedEntities, ctx.entitiesWithoutId)
        data.givenBulkInsertResult(ctx.preparedEntities, ctx.collectionName)  

        return expect(env.schemaAwareDataService.bulkInsert(ctx.collectionName, ctx.entitiesWithoutId)).resolves.toEqual({ items: ctx.preparedEntities })
    })

    test('update will prepare item for update and call data service with the prepared item', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        patcher.givenPreparedItemsForUpdateWith([ctx.preparedEntity], [ctx.entityWithExtraProps])
        data.givenUpdateResult(ctx.preparedEntity, ctx.collectionName)

        return expect(env.schemaAwareDataService.update(ctx.collectionName, ctx.entityWithExtraProps)).resolves.toEqual({ item: ctx.preparedEntity })
    })

    test('bulk update will prepare items for update and call data service with the prepared items', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        patcher.givenPreparedItemsForUpdateWith(ctx.preparedEntities, ctx.entitiesWithExtraProps)
        data.givenBulkUpdateResult(ctx.preparedEntities, ctx.collectionName)

        return expect(env.schemaAwareDataService.bulkUpdate(ctx.collectionName, ctx.entitiesWithExtraProps)).resolves.toEqual({ items: ctx.preparedEntities })
    })

    test('delete by item id will call data service', async() => {
        data.deleteResultTo(ctx.itemId, ctx.collectionName)

        return expect(env.schemaAwareDataService.delete(ctx.collectionName, ctx.itemId)).resolves.toEqual({ item: {} })
    })

    test('bulk delete by item ids will call data service', async() => {
        data.bulkDeleteResultTo(ctx.itemIds, ctx.collectionName)

        return expect(env.schemaAwareDataService.bulkDelete(ctx.collectionName, ctx.itemIds)).resolves.toEqual({ items: [] })
    })

    test('truncate will call data service', async() => {
        data.truncateResultTo(ctx.collectionName)

        return expect(env.schemaAwareDataService.truncate(ctx.collectionName)).resolves.toBeTruthy()
    })

    test('aggregate will validate filter and aggregation and call data service', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        queryValidator.givenValidFilterForDefaultFieldsOf(ctx.filter) 
        queryValidator.givenValidAggregationForDefaultFieldsOf(ctx.aggregation)
        
        data.givenAggregateResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit)
        
        return expect(env.schemaAwareDataService.aggregate(ctx.collectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit)).resolves.toEqual({ items: ctx.entities, totalCount: 0 })
    })
    
    const ctx = {
        collectionName: Uninitialized,
        entityWithoutId: Uninitialized,
        entities: Uninitialized,
        entity: Uninitialized,
        preparedEntity: Uninitialized,
        preparedEntities: Uninitialized,
        patchedEntities: Uninitialized,
        itemId: Uninitialized,
        itemIds: Uninitialized,
        entitiesWithoutId: Uninitialized,
        filter: Uninitialized,
        transformedFilter: Uninitialized,
        aggregation: Uninitialized,
        transformedAggregation: Uninitialized,
        totalCount: Uninitialized,
        sort: Uninitialized,
        limit: Uninitialized,
        skip: Uninitialized,
        projection: Uninitialized,
        defaultFields: Uninitialized,
        entityWithExtraProps: Uninitialized,
        entitiesWithExtraProps: Uninitialized,
    }

    interface Enviorment {
        schemaAwareDataService: SchemaAwareDataService
        dataService: DataService
    }

    const env: Enviorment = {
        dataService: Uninitialized,
        schemaAwareDataService: Uninitialized,
    }

    beforeEach(() => {
        data.reset()
        queryValidator.reset()
        schema.reset()

        env.schemaAwareDataService = new SchemaAwareDataService(data.dataService, queryValidator.queryValidator, schema.schemaInformation, patcher.itemTransformer)
        
        ctx.collectionName = chance.word()
        ctx.entity = gen.randomEntity()
        ctx.preparedEntity = gen.randomEntity()
        ctx.entities = gen.randomEntities()
        ctx.preparedEntities = gen.randomEntities()
        ctx.patchedEntities = gen.randomEntities()

        const e = gen.randomEntity()
        delete e['_id']
        ctx.entityWithoutId = e
        ctx.entitiesWithoutId = gen.randomEntities().map(i => { delete i['_id']; return i })
        ctx.entityWithExtraProps = { ...gen.randomEntity(), someProp: chance.word() }
        ctx.entitiesWithExtraProps = gen.randomEntities().map(i => ({ ...i, someProp: chance.word() }))

        ctx.itemId = chance.guid()
        ctx.itemIds = Array.from({ length: 10 }, () => chance.guid())

        ctx.filter = chance.word()
        ctx.transformedFilter = chance.word()
        ctx.aggregation = chance.word()
        ctx.transformedAggregation = chance.word()
        ctx.totalCount = chance.integer()
        ctx.sort = chance.word()
        ctx.skip = chance.integer()
        ctx.limit = chance.integer()
        ctx.projection = [chance.word()]
        ctx.defaultFields = SystemFields.map(f => f.name)
    })
})
