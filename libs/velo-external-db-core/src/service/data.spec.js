const DataService = require('./data')
const { Uninitialized, gen } = require('@wix-velo/test-commons')
const driver = require('../../test/drivers/data_provider_test_support')
const { SystemFields } = require('@wix-velo/velo-external-db-commons')
const Chance = require('chance')
const { getByIdFilterFor } = require('../utils/data_utils')
const chance = new Chance()

describe('Data Service', () => {

    test('delegate request to data provider and translate data to velo format', async() => {
        driver.givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection)
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)
        
        return expect(env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection)).resolves.toEqual({
                                                                                                                        items: ctx.entities,
                                                                                                                        totalCount: ctx.total
                                                                                                                    })
    })

    test('count data from collection', async() => {
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)

        return expect(env.dataService.count(ctx.collectionName, ctx.filter)).resolves.toEqual({ totalCount: ctx.total })
    })

    test('get by id will issue a call to find and transform the result', async() => {
        const idFilter = getByIdFilterFor(ctx.itemId)
        driver.givenListResult([ctx.entity], ctx.collectionName,
                        idFilter, '', 0, 1, ctx.defaultProjection)

        return expect(env.dataService.getById(ctx.collectionName, ctx.itemId, ctx.defaultProjection)).resolves.toEqual({ item: ctx.entity })
    })

    test('get by id without item as a result will return item: null', async() => {
        const idFilter = getByIdFilterFor(ctx.itemId)
        driver.givenListResult([], ctx.collectionName,
                        idFilter, '', 0, 1, ctx.defaultProjection)

        return expect(env.dataService.getById(ctx.collectionName, ctx.itemId, ctx.defaultProjection)).resolves.toEqual({ item: null })
    })

    test('insert will insert data into db', async() => {
        driver.expectInsertFor([ctx.entity], ctx.collectionName)

        return expect(env.dataService.insert(ctx.collectionName, ctx.entity)).resolves.toEqual({ item: ctx.entity })
    })

    test('bulk insert will insert data into db', async() => {
        driver.expectInsertFor(ctx.entities, ctx.collectionName)

        return expect(env.dataService.bulkInsert(ctx.collectionName, ctx.entities)).resolves.toEqual({ items: ctx.entities })
    })

    test('update will update data into db', async() => {
        driver.expectUpdateFor([ctx.entity], ctx.collectionName)

        return expect(env.dataService.update(ctx.collectionName, ctx.entity)).resolves.toEqual({ item: ctx.entity })
    })

    test('bulk update will update data into db', async() => {
        driver.expectUpdateFor(ctx.entities, ctx.collectionName)

        return expect(env.dataService.bulkUpdate(ctx.collectionName, ctx.entities)).resolves.toEqual({ items: ctx.entities })
    })

    test('delete by item id', async() => {
        driver.expectDeleteFor([ctx.itemId], ctx.collectionName)

        return expect(env.dataService.delete(ctx.collectionName, ctx.itemId)).resolves.toEqual({ item: {} })
    })

    test('bulk delete by item ids', async() => {
        driver.expectDeleteFor(ctx.itemIds, ctx.collectionName)

        return expect(env.dataService.bulkDelete(ctx.collectionName, ctx.itemIds)).resolves.toEqual({ items: [] })
    })

    
    // eslint-disable-next-line jest/expect-expect
    test('truncate will clear collection', async() => {
        driver.expectTruncateFor(ctx.collectionName)

        await env.dataService.truncate(ctx.collectionName)
    })

    test('aggregate api', async() => {
        driver.givenAggregateResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.aggregation)

        return expect(env.dataService.aggregate(ctx.collectionName, ctx.filter, ctx.aggregation)).resolves.toEqual({ items: ctx.entities, totalCount: 0 })
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

        ctx.collectionName = gen.randomCollectionName()
        ctx.filter = chance.word()
        ctx.aggregation = chance.word()
        ctx.sort = chance.word()
        ctx.skip = chance.word()
        ctx.limit = chance.word()
        ctx.defaultProjection = SystemFields.map(f => f.name)

        ctx.itemId = chance.guid()
        ctx.itemIds = Array.from({ length: 10 }, () => chance.guid())
        ctx.total = chance.natural({ min: 2, max: 20 })

        ctx.entities = gen.randomEntities()
        ctx.entity = gen.randomEntity()

        const e = gen.randomEntity()
        delete e._id
        ctx.entityWithoutId = e
        ctx.entitiesWithoutId = gen.randomEntities().map(i => { delete i._id; return i })

        env.dataService = new DataService(driver.dataProvider)
    })
})
