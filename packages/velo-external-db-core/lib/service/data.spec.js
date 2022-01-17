const DataService = require('./data')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/data_provider_test_support')
const schema = require('../../test/drivers/schema_information_test_support')
const filterTransformer = require ('../../test/drivers/filter_transformer_test_support')
const aggregationTransformer = require('../../test/drivers/aggregation_transformer_test_support')
const queryValidator = require('../../test/drivers/query_validator_test_support')
const { AdapterOperators } = require('velo-external-db-commons')
const Chance = require('chance')
const chance = new Chance()

describe('Data Service', () => {

    test('delegate request to data provider and translate data to velo format', async() => {
        driver.givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)
        schema.givenDefaultSchemaFor(ctx.collectionName)
        filterTransformer.givenTransformResult(ctx.filter)

        const transformedFilter = filterTransformer.transform(ctx.filter)
        const fields = await schema.schemaInformation.schemaFieldsFor(ctx.collectionName)
        
        queryValidator.expectValidFilter(fields, transformedFilter)

        const actual = await env.dataService.find(ctx.collectionName, transformedFilter, ctx.sort, ctx.skip, ctx.limit)
        expect( actual ).toEqual({ items: ctx.entities, totalCount: ctx.entities.length })
    })

    test('count data from collection', async() => {
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)
        filterTransformer.givenTransformResult(ctx.filter)

        const transformedFilter = filterTransformer.transform(ctx.filter)

        const actual = await env.dataService.count(ctx.collectionName, transformedFilter)
        expect( actual ).toEqual({ totalCount: ctx.total })
    })

    test('get by id will issue a call to find and transform the result', async() => {
        const idFilter = { fieldName: '_id', operator: AdapterOperators.eq, value: ctx.itemId } 
        driver.givenListResult([ctx.entity], ctx.collectionName,
                        idFilter, '', 0, 1)

        const actual = await env.dataService.getById(ctx.collectionName, ctx.itemId)
        expect( actual ).toEqual({ item: ctx.entity })
    })

    test('insert will insert data into db', async() => {
        driver.expectInsertFor([ctx.entity], ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.insert(ctx.collectionName, ctx.entity)
        return expect( actual  ).toEqual({ item: ctx.entity })
    })

    test('insert will removed fields that does not exists in the schema from entities', async() => {
        driver.expectInsertFor([ctx.entity], ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.insert(ctx.collectionName, { ...ctx.entity, some: 'prop' })
        return expect( actual  ).toEqual({ item: ctx.entity })
    })

    test('insert will add default values according to the schema', async() => {
        driver.expectInsertMatchedFor([ctx.entityWithoutId], ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.insert(ctx.collectionName, ctx.entityWithoutId)
        return expect( actual.item  ).toHaveProperty('_id' )
    })

    test('bulk insert items without _id will apply random _id to all items', async() => {
        driver.expectInsertMatchedFor(ctx.entitiesWithoutId, ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.bulkInsert(ctx.collectionName, ctx.entitiesWithoutId)

        return actual.items.map(item => expect(item).toHaveProperty( '_id' ) )
    })

    test('bulk insert will insert data into db', async() => {
        driver.expectInsertFor(ctx.entities, ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.bulkInsert(ctx.collectionName, ctx.entities)
        return expect( actual  ).toEqual({ items: ctx.entities })
    })

    test('update will update data into db', async() => {
        driver.expectUpdateFor([ctx.entity], ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.update(ctx.collectionName, ctx.entity)
        expect( actual ).toEqual({ item: ctx.entity })
    })

    test('update will remove non existing fields from update according to the schema', async() => {
        driver.expectUpdateFor([ctx.entity], ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.update(ctx.collectionName, { ...ctx.entity, someProp: 'whatever' })
        expect( actual ).toEqual({ item: ctx.entity })
    })

    test('bulk update will update data into db', async() => {
        driver.expectUpdateFor(ctx.entities, ctx.collectionName)
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const actual = await env.dataService.bulkUpdate(ctx.collectionName, ctx.entities)
        expect( actual ).toEqual({ items: ctx.entities })
    })

    test('delete by item id', async() => {
        driver.expectDeleteFor([ctx.itemId], ctx.collectionName)

        const actual = await env.dataService.delete(ctx.collectionName, ctx.itemId)
        expect( actual ).toEqual({ item: {} })
    })

    test('bulk delete by item ids', async() => {
        driver.expectDeleteFor(ctx.itemIds, ctx.collectionName)

        const actual = await env.dataService.bulkDelete(ctx.collectionName, ctx.itemIds)
        expect( actual ).toEqual({ items: [] })
    })

    
    // eslint-disable-next-line jest/expect-expect
    test('truncate will clear collection', async() => {
        driver.expectTruncateFor(ctx.collectionName)

        await env.dataService.truncate(ctx.collectionName)
    })

    test('aggregate api', async() => {
        driver.givenAggregateResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.aggregation)
        aggregationTransformer.givenAggregateTransformResult(ctx.aggregation)
        filterTransformer.givenTransformResult(ctx.filter)

        const transformedFilter = filterTransformer.transform(ctx.filter)
        const transformedAggregate = aggregationTransformer.transform(ctx.aggregation)

        const actual = await env.dataService.aggregate(ctx.collectionName, transformedFilter, transformedAggregate)

        expect( actual ).toEqual({ items: ctx.entities, totalCount: 0 })
    })

    const ctx = {
        collectionName: Uninitialized,
        filter: Uninitialized,
        aggregation: Uninitialized,
        sort: Uninitialized,
        skip: Uninitialized,
        limit: Uninitialized,
        entities: Uninitialized,
        entity: Uninitialized,
        entityWithoutId: Uninitialized,
        entitiesWithoutId: Uninitialized,
        itemId: Uninitialized,
        itemIds: Uninitialized,
        total: Uninitialized,
    }

    const env = {
        dataService: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        schema.reset()
        filterTransformer.reset()
        aggregationTransformer.reset()
        queryValidator.reset()

        ctx.collectionName = gen.randomCollectionName()
        ctx.filter = chance.word()
        ctx.aggregation = chance.word()
        ctx.sort = chance.word()
        ctx.skip = chance.word()
        ctx.limit = chance.word()
        ctx.itemId = chance.guid()
        ctx.itemIds = Array.from({ length: 10 }, () => chance.guid())
        ctx.total = chance.natural({ min: 2, max: 20 })

        ctx.entities = gen.randomEntities()
        ctx.entity = gen.randomEntity()

        const e = gen.randomEntity()
        delete e._id
        ctx.entityWithoutId = e
        ctx.entitiesWithoutId = gen.randomEntities().map(i => { delete i._id; return i })

        env.dataService = new DataService(driver.dataProvider, schema.schemaInformation, filterTransformer.filterTransformer, aggregationTransformer.aggregationTransformer, queryValidator.queryValidator)
    })
})
