import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const { UpdateImmediately, DeleteImmediately, Truncate, Aggregate, FindWithSort, Projection, FilterByEveryField } = SchemaOperations
import { testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import * as gen from '../gen'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as data from '../drivers/data_api_rest_test_support'
import * as matchers from '../drivers/schema_api_rest_matchers'
import { authAdmin, authOwner, authVisitor } from '@wix-velo/external-db-testkit'
import * as authorization from '../drivers/authorization_test_support'
import Chance = require('chance')
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/e2e_resources'

const chance = Chance()

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB Data REST API: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        await setupDb()
        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    testIfSupportedOperationsIncludes(supportedOperations, [ FindWithSort ])('find api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await authorization.givenCollectionWithVisitorReadPolicy(ctx.collectionName)
        await expect( axios.post('/data/find', { collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 }, authVisitor) ).resolves.toEqual(
            expect.objectContaining({ data: {
                    items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                    totalCount: 2
                } }))
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [FilterByEveryField])('find api - filter by date', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)
        const filterByDate = {
            _createdDate: { $gte: ctx.pastVeloDate }
        }

        await expect( axios.post('/data/find', { collectionName: ctx.collectionName, filter: filterByDate, skip: 0, limit: 25 }, authOwner) ).resolves.toEqual(
            expect.objectContaining({ data: {
                    items: [ ctx.item ],
                    totalCount: 1
                } }))
    })
    
    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('find api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item ], ctx.collectionName, authAdmin)
        await expect( axios.post('/data/find', { collectionName: ctx.collectionName, filter: '', skip: 0, limit: 25, projection: [ctx.column.name] }, authOwner) ).resolves.toEqual(
            expect.objectContaining({ data: {
                    items: [ ctx.item ].map(item => ({ [ctx.column.name]: item[ctx.column.name] })),
                    totalCount: 1
                } }))
    })
    
    //todo: create another test without sort for these implementations

    test('insert api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await axios.post('/data/insert', { collectionName: ctx.collectionName, item: ctx.item }, authAdmin)

        await expect( data.expectAllDataIn(ctx.collectionName, authAdmin) ).resolves.toEqual({ items: [ctx.item], totalCount: 1 })
    })

    test('bulk insert api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        await axios.post('/data/insert/bulk', { collectionName: ctx.collectionName, items: ctx.items }, authAdmin)

        await expect( data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual( { items: expect.arrayContaining(ctx.items), totalCount: ctx.items.length })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Aggregate ])('aggregate api', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authAdmin)

        await expect( axios.post('/data/aggregate',
            {
                collectionName: ctx.collectionName,
                filter: { _id: { $eq: ctx.numberItem._id } },
                processingStep: {
                    _id: {
                        field1: '$_id',
                        field2: '$_owner',
                    },
                    myAvg: {
                        $avg: `$${ctx.numberColumns[0].name}`
                    },
                    mySum: {
                        $sum: `$${ctx.numberColumns[1].name}`
                    }
                },
                postFilteringStep: {
                    $and: [
                        { myAvg: { $gt: 0 } },
                        { mySum: { $gt: 0 } }
                    ],
                },
            }, authAdmin) ).resolves.toEqual(matchers.responseWith({ items: [ { _id: ctx.numberItem._id, _owner: ctx.numberItem._owner, myAvg: ctx.numberItem[ctx.numberColumns[0].name], mySum: ctx.numberItem[ctx.numberColumns[1].name] } ],
            totalCount: 0 }))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('delete one api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await axios.post('/data/remove', { collectionName: ctx.collectionName, itemId: ctx.item._id }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({ items: [ ], totalCount: 0 })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('bulk delete api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

        await axios.post('/data/remove/bulk', { collectionName: ctx.collectionName, itemIds: ctx.items.map((i: { _id: any }) => i._id) }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({ items: [ ], totalCount: 0 })
    })

    test('get by id api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect( axios.post('/data/get', { collectionName: ctx.collectionName, itemId: ctx.item._id }, authAdmin) ).resolves.toEqual(matchers.responseWith({ item: ctx.item }))
    })

    test('get by id api should throw 404 if not found', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect( axios.post('/data/get', { collectionName: ctx.collectionName, itemId: 'wrong' }, authAdmin) ).rejects.toThrow('404')
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ Projection ])('get by id api with projection', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect(axios.post('/data/get', { collectionName: ctx.collectionName, itemId: ctx.item._id, projection: [ctx.column.name] }, authAdmin)).resolves.toEqual(
            matchers.responseWith({
                item: { [ctx.column.name]: ctx.item[ctx.column.name] }
            }))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('update api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await axios.post('/data/update', { collectionName: ctx.collectionName, item: ctx.modifiedItem }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({ items: [ctx.modifiedItem], totalCount: 1 })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ UpdateImmediately ])('bulk update api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

        await axios.post('/data/update/bulk', { collectionName: ctx.collectionName, items: ctx.modifiedItems }, authAdmin)

        await expect( data.expectAllDataIn(ctx.collectionName, authAdmin) ).resolves.toEqual( { items: expect.arrayContaining(ctx.modifiedItems), totalCount: ctx.modifiedItems.length })
    })

    test('count api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)

        await expect( axios.post('/data/count', { collectionName: ctx.collectionName, filter: '' }, authAdmin) ).resolves.toEqual(matchers.responseWith( { totalCount: 2 } ))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ Truncate ])('truncate api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)

        await axios.post('/data/truncate', { collectionName: ctx.collectionName }, authAdmin)

        await expect( data.expectAllDataIn(ctx.collectionName, authAdmin) ).resolves.toEqual({ items: [ ], totalCount: 0 })
    })

    test('insert undefined to number columns should inserted as null', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        delete ctx.numberItem[ctx.numberColumns[0].name]
        delete ctx.numberItem[ctx.numberColumns[1].name]

        await axios.post('/data/insert', { collectionName: ctx.collectionName, item: ctx.numberItem }, authAdmin)


        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({
            items: [
                {
                    ...ctx.numberItem,
                    [ctx.numberColumns[0].name]: null,
                    [ctx.numberColumns[1].name]: null,
                }
            ], totalCount: 1
        })
    })


    test('update undefined to number columns should insert nulls', async() => {
        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
        await data.givenItems([ctx.numberItem], ctx.collectionName, authAdmin)
        ctx.numberItem[ctx.numberColumns[0].name] = null
        ctx.numberItem[ctx.numberColumns[1].name] = null

        await axios.post('/data/update', { collectionName: ctx.collectionName, item: ctx.numberItem }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({
            items: [
                {
                    ...ctx.numberItem,
                    [ctx.numberColumns[0].name]: null,
                    [ctx.numberColumns[1].name]: null,
                }
            ], totalCount: 1
        })
    })


    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        numberColumns: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        modifiedItem: Uninitialized,
        modifiedItems: Uninitialized,
        anotherItem: Uninitialized,
        numberItem: Uninitialized,
        anotherNumberItem: Uninitialized,
        pastVeloDate: Uninitialized,
    }

    afterAll(async() => await teardownApp())

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.item = genCommon.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map((i: any) => ( { ...i, [ctx.column.name]: chance.word() } ) )
        ctx.modifiedItem = { ...ctx.item, [ctx.column.name]: chance.word() }
        ctx.anotherItem = genCommon.randomEntity([ctx.column.name])
        ctx.numberItem = genCommon.randomNumberEntity(ctx.numberColumns)
        ctx.anotherNumberItem = genCommon.randomNumberEntity(ctx.numberColumns)
        ctx.pastVeloDate = genCommon.pastVeloDate()
    })
})
