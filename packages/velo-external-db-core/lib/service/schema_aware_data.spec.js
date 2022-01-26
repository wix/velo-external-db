const SchemaAwareDataService = require ('./schema_aware_data')
const schema = require ('../../test/drivers/schema_information_test_support')
const data = require ('../../test/drivers/data_service_test_support')
const queryValidator = require('../../test/drivers/query_validator_test_support')
const { Uninitialized, gen } = require('test-commons')
const Chance = require('chance')
const chance = new Chance()

describe ('Schema Aware Data Service', () => {
    
    test('find validate filter and call data service', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        queryValidator.givenValidFilterForDefaultFieldsOf(ctx.transformedFilter) 
        data.givenListResult(ctx.entities, ctx.totalCount, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

        return expect(env.schemaAwareDataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)).resolves.toEqual({
                                                                                                                        items: ctx.entities,
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
        data.givenGetByIdResult(ctx.entity, ctx.collectionName, ctx.itemId)

        return expect(env.schemaAwareDataService.getById(ctx.collectionName, ctx.itemId)).resolves.toEqual({ item: ctx.entity })
    })

    test('insert will prepare item for insert and call data service with the prepared item', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        const [item] = await env.schemaAwareDataService.prepareItemsForInsert(ctx.collectionName, [ctx.entityWithoutId]) //todo: mock this
        
        data.givenInsertResult(item, ctx.collectionName)

        return expect(env.schemaAwareDataService.insert(ctx.collectionName, ctx.entityWithoutId)).resolves.toEqual({ item })
    })

    test('bulk insert will prepare items for insert and call data service with the prepared items', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        const items = await env.schemaAwareDataService.prepareItemsForInsert(ctx.collectionName, ctx.entitiesWithoutId)
        
        data.givenBulkInsertResult(items, ctx.collectionName)  

        return expect(env.schemaAwareDataService.bulkInsert(ctx.collectionName, ctx.entitiesWithoutId)).resolves.toEqual({ items })
    })

    test('update will prepare item for update and call data service with the prepared item', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        const [item] = await env.schemaAwareDataService.prepareItemsForUpdate(ctx.collectionName, [ctx.entityWithExtraProps]) //todo: mock this
        
        data.givenUpdateResult(item, ctx.collectionName)

        return expect(env.schemaAwareDataService.update(ctx.collectionName, ctx.entityWithExtraProps)).resolves.toEqual({ item })
    })

    test('bulk update will prepare items for update and call data service with the prepared items', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        const items = await env.schemaAwareDataService.prepareItemsForUpdate(ctx.collectionName, ctx.entitiesWithExtraProps) 
        
        data.givenBulkUpdateResult(items, ctx.collectionName)

        return expect(env.schemaAwareDataService.bulkUpdate(ctx.collectionName, ctx.entitiesWithExtraProps)).resolves.toEqual({ items })
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
        
        data.givenAggregateResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.aggregation)
        
        return expect(env.schemaAwareDataService.aggregate(ctx.collectionName, ctx.filter, ctx.aggregation)).resolves.toEqual({ items: ctx.entities, totalCount: 0 })
    })
    
    const ctx = {
        collectionName: Uninitialized,
        entityWithoutId: Uninitialized,
        entities: Uninitialized,
        entity: Uninitialized,
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
        skip: Uninitialized
    }

    const env = {
        dataService: Uninitialized,
    }

    beforeEach(() => {
        env.schemaAwareDataService = new SchemaAwareDataService(data.dataService, queryValidator.queryValidator, schema.schemaInformation)
        ctx.entity = gen.randomEntity()
        ctx.entities = gen.randomEntities()
        const e = gen.randomEntity()
        delete e._id
        ctx.entityWithoutId = e
        ctx.entitiesWithoutId = gen.randomEntities().map(i => { delete i._id; return i })
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
    })
})