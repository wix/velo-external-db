const PreDataService = require ('./pre_data')
const schema = require('../../test/drivers/schema_information_test_support')
const filterTransformer = require ('../../test/drivers/filter_transformer_test_support')
const aggregationTransformer = require('../../test/drivers/aggregation_transformer_test_support')
const queryValidator = require('../../test/drivers/query_validator_test_support')
const { Uninitialized, gen } = require('test-commons')
const Chance = require('chance')
const chance = new Chance()

describe ('Pre Data Service', () => {
    test('transformAndValidateFilter will transform and validate the filter', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        filterTransformer.givenTransformTo(ctx.filter, ctx.transformedFilter)
        queryValidator.givenValidFilterForDefaultFieldsOf(ctx.transformedFilter) //todo: check if validate is called.
        
        return expect(env.preDataService.transformAndValidateFilter(ctx.collectionName, ctx.filter)).resolves.toEqual(ctx.transformedFilter)
    }) 

    test('transformAndValidateAggregation will transform and validate the aggregation', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)
        aggregationTransformer.givenTransformTo(ctx.aggregation, ctx.transformAggregation)

        return expect(env.preDataService.transformAndValidateFilter(ctx.collectionName, ctx.filter)).resolves.toEqual(ctx.transformedFilter)
    }) 

    test('prepareItemsForInsert will add default values according to the schema', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const items = await env.preDataService.prepareItemsForInsert(ctx.collectionName, ctx.entitiesWithoutId)

        return items.map(item => expect(item).toHaveProperty( '_id' ))
    })

    test('prepareItemsForInsert will remove non existing fields from insert according to the schema', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const items = await env.preDataService.prepareItemsForInsert(ctx.collectionName, [{ ...ctx.entity, someProp: 'whatever' }])
        return items.map(item => expect(item).not.toHaveProperty('someProp'))
    })

    test('prepareItemsForUpdate will remove non existing fields from update according to the schema', async() => {
        schema.givenDefaultSchemaFor(ctx.collectionName)

        const items = await env.preDataService.prepareItemsForInsert(ctx.collectionName, [{ ...ctx.entity, someProp: 'whatever' }])
        return items.map(item => expect(item).not.toHaveProperty('someProp'))
    })
    
    const ctx = {
        collectionName: Uninitialized,
        entityWithoutId: Uninitialized,
        entity: Uninitialized,
        entitiesWithoutId: Uninitialized,
        filter: Uninitialized,
        transformedFilter: Uninitialized,
        aggregation: Uninitialized,
        transformedAggregation: Uninitialized
    }

    const env = {
        dataService: Uninitialized,
    }

    beforeEach(() => {
        env.preDataService = new PreDataService(filterTransformer.filterTransformer, aggregationTransformer.aggregationTransformer, queryValidator.queryValidator, schema.schemaInformation)
        ctx.entity = gen.randomEntity()
        const e = gen.randomEntity()
        delete e._id
        ctx.entityWithoutId = e
        ctx.entitiesWithoutId = gen.randomEntities().map(i => { delete i._id; return i })
        ctx.filter = chance.word()
        ctx.transformedFilter = chance.word()
        ctx.aggregation = chance.word()
        ctx.transformedAggregation = chance.word()
    })
})