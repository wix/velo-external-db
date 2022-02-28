const { Uninitialized, gen } = require('test-commons')
const { testIfSchemaSupportsUpdateImmediately, testIfSchemaSupportsDeleteImmediately, testIfSchemaSupportsTruncate, testIfSchemaSupportsAggregate, testIfSchemaSupportsFindWithSort } = require('test-commons')
const schema = require('../drivers/schema_api_rest_test_support')
const data = require('../drivers/data_api_rest_test_support')
const matchers = require('../drivers/schema_api_rest_matchers')
const { authAdmin, authOwner, authVisitor } = require('../drivers/auth_test_support')
const authorization = require ('../drivers/authorization_test_support')
const Chance = require('chance')
const { env, initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } = require('../resources/e2e_resources')

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

    test('find api', async() => testIfSchemaSupportsFindWithSort(env, async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
        await authorization.givenCollectionWithVisitorReadPolicy(ctx.collectionName)
        await expect( axios.post('/data/find', { collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 }, authVisitor) ).resolves.toEqual(
            expect.objectContaining({ data: {
                    items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                    totalCount: 2
                } }))
    }))

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


    test('aggregate api', async() => testIfSchemaSupportsAggregate(env, async() => {
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
    }))

    test('delete one api', async() => testIfSchemaSupportsDeleteImmediately(env, async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await axios.post('/data/remove', { collectionName: ctx.collectionName, itemId: ctx.item._id }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({ items: [ ], totalCount: 0 })
    }))

    test('bulk delete api', async() => testIfSchemaSupportsDeleteImmediately(env, async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

        await axios.post('/data/remove/bulk', { collectionName: ctx.collectionName, itemIds: ctx.items.map(i => i._id) }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({ items: [ ], totalCount: 0 })
    }))

    test('get by id api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await expect( axios.post('/data/get', { collectionName: ctx.collectionName, itemId: ctx.item._id }, authAdmin) ).resolves.toEqual(matchers.responseWith({ item: ctx.item }))
    })

    test('update api', async() => testIfSchemaSupportsUpdateImmediately(env, async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

        await axios.post('/data/update', { collectionName: ctx.collectionName, item: ctx.modifiedItem }, authAdmin)

        await expect(data.expectAllDataIn(ctx.collectionName, authAdmin)).resolves.toEqual({ items: [ctx.modifiedItem], totalCount: 1 })
    }))

    test('bulk update api', async() => testIfSchemaSupportsUpdateImmediately(env, async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

        await axios.post('/data/update/bulk', { collectionName: ctx.collectionName, items: ctx.modifiedItems }, authAdmin)

        await expect( data.expectAllDataIn(ctx.collectionName, authAdmin) ).resolves.toEqual( { items: expect.arrayContaining(ctx.modifiedItems), totalCount: ctx.modifiedItems.length })
    }))

    test('count api', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)

        await expect( axios.post('/data/count', { collectionName: ctx.collectionName, filter: '' }, authAdmin) ).resolves.toEqual(matchers.responseWith( { totalCount: 2 } ))
    })


    test('truncate api', async() => testIfSchemaSupportsTruncate(env, async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)

        await axios.post('/data/truncate', { collectionName: ctx.collectionName }, authAdmin)

        await expect( data.expectAllDataIn(ctx.collectionName, authAdmin) ).resolves.toEqual({ items: [ ], totalCount: 0 })
    }))



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
    }

    afterAll(async() => await teardownApp())

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.item = gen.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => gen.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map(i => ( { ...i, [ctx.column.name]: chance.word() } ) )
        ctx.modifiedItem = { ...ctx.item, [ctx.column.name]: chance.word() }
        ctx.anotherItem = gen.randomEntity([ctx.column.name])
        ctx.numberItem = gen.randomNumberDbEntity(ctx.numberColumns)
        ctx.anotherNumberItem = gen.randomNumberDbEntity(ctx.numberColumns)
    })
})
