import DataService from './data'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/data_provider_test_support'
import { SystemFields } from '@wix-velo/velo-external-db-commons'
import Chance = require('chance')
import { getByIdFilterFor } from '../utils/data_utils'
import { asWixDataItem } from '../converters/data_utils'
import { ErrorCodes } from '../spi-model/errors'
const chance = new Chance()

describe('Data Service', () => {

    test('delegate request to data provider and translate data to velo format', async() => {
        driver.givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection)
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)
        
        return expect(env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection, true)).resolves.toEqual({
                                                                                                                        items: ctx.entities,
                                                                                                                        totalCount: ctx.total
                                                                                                                    })
    })

    test('delegate request to data provider and translate data to velo format with returnTotalCount flag set to false', async() => {
        driver.givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection)
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)
        
        return expect(env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection, false)).resolves.toEqual({
                                                                                                                        items: ctx.entities,
                                                                                                                        totalCount: undefined
                                                                                                                    })
    })
    
    test('delegate request to data provider, translate data to velo format and generate _id', async() => {
        driver.givenListResult(ctx.entitiesWithoutId, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection)
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)
        
        return expect(env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit, ctx.defaultProjection, true)).resolves.toEqual({
                                                                                                                        items: ctx.entitiesWithoutId.map((entity: any) => ({ ...entity, _id: expect.any(String) })),
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
        driver.expectInsertFor([ctx.entity], ctx.collectionName,  ctx.defaultProjection)

        return expect(env.dataService.insert(ctx.collectionName, ctx.entity, ctx.defaultProjection)).resolves.toEqual({ item: ctx.entity })
    })

    test('bulk insert will insert data into db', async() => {
        driver.expectInsertFor(ctx.entities, ctx.collectionName, ctx.defaultProjection)

        return expect(env.dataService.bulkInsert(ctx.collectionName, ctx.entities, ctx.defaultProjection)).resolves.toEqual({ items: ctx.entities.map(asWixDataItem) })
    })

    test('insert already item will return error object', async() => {        
        driver.expectInsertAlreadyExistsFor([ctx.entity], ctx.collectionName,  ctx.defaultProjection)

        return expect(env.dataService.insert(ctx.collectionName, ctx.entity, ctx.defaultProjection)).resolves.toEqual({ error: { errorCode: ErrorCodes.ITEM_ALREADY_EXISTS, errorMessage: expect.any(String), data: expect.any(Object)  } })
    })

    test('update will update data into db', async() => {
        driver.expectUpdateFor([ctx.entity], ctx.collectionName)

        return expect(env.dataService.update(ctx.collectionName, ctx.entity)).resolves.toEqual({ item: ctx.entity })
    })

    test('bulk update will update data into db', async() => {
        driver.expectUpdateFor(ctx.entities, ctx.collectionName)

        return expect(env.dataService.bulkUpdate(ctx.collectionName, ctx.entities)).resolves.toEqual({ items: ctx.entities.map(asWixDataItem) })
    })

    test('delete by item id', async() => {
        driver.givenItemsById(([ctx.entity]), ctx.collectionName, '', 0, 1, ctx.defaultProjection)
        driver.expectDeleteFor([ctx.entity], ctx.collectionName)
        return expect(env.dataService.delete(ctx.collectionName, ctx.entity._id, ctx.defaultProjection)).resolves.toEqual({ item: ctx.entity })
    })

    test('bulk delete by item ids', async() => {
        driver.givenItemsById(ctx.entities, ctx.collectionName, '', 0, 1, ctx.defaultProjection)
        driver.expectDeleteFor(ctx.itemIds, ctx.collectionName)

        return expect(env.dataService.bulkDelete(ctx.collectionName, ctx.entities.map((e: any) => e._id), ctx.defaultProjection)).resolves.toEqual({ items: ctx.entities.map(asWixDataItem) })
    })
    
    // eslint-disable-next-line jest/expect-expect
    test('truncate will clear collection', async() => {
        driver.expectTruncateFor(ctx.collectionName)

        await env.dataService.truncate(ctx.collectionName)
    })

    test('aggregate api', async() => {
        driver.givenAggregateResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit)
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)

        return expect(env.dataService.aggregate(ctx.collectionName, ctx.filter, ctx.aggregation, ctx.sort, ctx.skip, ctx.limit, true)).resolves.toEqual({ items: ctx.entities, totalCount: ctx.total })
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
        defaultProjection: Uninitialized
    }

    interface Enviorment {
        dataService: DataService
    }

    const env: Enviorment = {
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
        delete e['_id']
        ctx.entityWithoutId = e
        ctx.entitiesWithoutId = gen.randomEntities().map(i => { delete i['_id']; return i })

        env.dataService = new DataService(driver.dataProvider)
    })
})
