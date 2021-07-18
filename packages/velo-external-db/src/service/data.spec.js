const DataService = require('./data')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/data-provider-test-support');
const Chance = require('chance');
const chance = new Chance();

describe('Data Service', () => {

    test('delegate request to data provider and translate data to velo format', async () => {
        driver.givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

        const actual = await env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)
        expect( actual ).toEqual({ items: ctx.entities, totalCount: 0 });
    })

    test('count data from collection', async () => {
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)

        const actual = await env.dataService.count(ctx.collectionName, ctx.filter)
        expect( actual ).toEqual({ totalCount: ctx.total });
    })

    test('get by id will issue a call to find and transform the result', async () => {
        driver.givenListResult([ctx.entity], ctx.collectionName,
                        { kind: 'filter',
                               operator: '$eq',
                               fieldName: '_id',
                               value: ctx.itemId
                              }, '', 0, 1)

        const actual = await env.dataService.getById(ctx.collectionName, ctx.itemId)
        expect( actual ).toEqual({ item: ctx.entity });
    })

    test('insert will insert data into db', async () => {
        driver.expectInsertFor([ctx.entity], ctx.collectionName)

        const actual = await env.dataService.insert(ctx.collectionName, ctx.entity)
        return expect( actual  ).toEqual({ item: ctx.entity });
    })

    test('bulk insert will insert data into db', async () => {
        driver.expectInsertFor(ctx.entities, ctx.collectionName)

        const actual = await env.dataService.bulkInsert(ctx.collectionName, ctx.entities)
        return expect( actual  ).toEqual({ items: ctx.entities });
    })

    test('update will update data into db', async () => {
        driver.expectUpdateFor([ctx.entity], ctx.collectionName)

        const actual = await env.dataService.update(ctx.collectionName, ctx.entity)
        expect( actual ).toEqual({ item: ctx.entity });
    })

    test('bulk update will update data into db', async () => {
        driver.expectUpdateFor(ctx.entities, ctx.collectionName)

        const actual = await env.dataService.bulkUpdate(ctx.collectionName, ctx.entities)
        expect( actual ).toEqual({ items: ctx.entities });
    })

    test('delete by item id', async () => {
        driver.expectDeleteFor([ctx.itemId], ctx.collectionName)

        const actual = await env.dataService.delete(ctx.collectionName, ctx.itemId)
        expect( actual ).toEqual({ item: {} });
    })

    test('bulk delete by item ids', async () => {
        driver.expectDeleteFor(ctx.itemIds, ctx.collectionName)

        const actual = await env.dataService.bulkDelete(ctx.collectionName, ctx.itemIds)
        expect( actual ).toEqual({ items: [] });
    })

    test('truncate will clear collection', async () => {
        driver.expectTruncateFor(ctx.collectionName)

        await env.dataService.truncate(ctx.collectionName)
    })

    test('aggregate api', async () => {
        driver.givenAggregateResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.aggregation)

        const actual = await env.dataService.aggregate(ctx.collectionName, ctx.filter, ctx.aggregation)

        expect( actual ).toEqual({ items: ctx.entities, totalCount: 0 });
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
        itemId: Uninitialized,
        itemIds: Uninitialized,
        total: Uninitialized,
    };

    const env = {
        dataService: Uninitialized,
    };

    beforeEach(() => {
        driver.reset()

        ctx.collectionName = gen.randomCollectionName()
        ctx.filter = chance.word();
        ctx.aggregation = chance.word();
        ctx.sort = chance.word();
        ctx.skip = chance.word();
        ctx.limit = chance.word();
        ctx.itemId = chance.guid();
        ctx.itemIds = Array.from({length: 10}, () => chance.guid())
        ctx.total = chance.natural({min: 2, max: 20});

        ctx.entities = gen.randomEntities();
        ctx.entity = gen.randomEntity();

        env.dataService = new DataService(driver.dataProvider)
    });
})
