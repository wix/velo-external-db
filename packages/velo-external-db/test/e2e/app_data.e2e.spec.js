const { Uninitialized, gen } = require('test-commons')
const schema = require('../drivers/schema_api_rest_test_support');
const data = require('../drivers/data_api_rest_test_support');
const { authAdmin, authOwner } = require('../drivers/auth_test_support')
const Chance = require('chance')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, testSuits } = require('../resources/e2e_resources')

const chance = Chance();

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});

describe('Velo External DB Data REST API',  () => {
    each(testSuits()).describe('%s', (name, setup) => {
        beforeAll(async () => {
            await setup()

            await initApp()
        }, 20000);

        afterAll(async () => {
            await dbTeardown()
        }, 20000);

        test('find api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)
            expect((await axios.post(`/data/find`, {collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 }, authAdmin)).data).toEqual({ items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                totalCount: 0});
        })

        test('insert api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

            await axios.post(`/data/insert`, {collectionName: ctx.collectionName, item: ctx.item }, authAdmin)

            expect(await data.expectAllDataIn(ctx.collectionName, authAdmin)).toEqual({ items: [ctx.item], totalCount: 0});
        })

        test('bulk insert api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

            await axios.post(`/data/insert/bulk`, {collectionName: ctx.collectionName, items: ctx.items }, authAdmin)

            expect((await data.expectAllDataIn(ctx.collectionName, authAdmin)).items).toEqual(expect.arrayContaining(ctx.items));
        })

        if (name !== 'Firestore' && name !== 'Airtable') {
        test('aggregate api', async () => {
            await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
            await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authAdmin)

            expect((await axios.post(`/data/aggregate`,
                { collectionName: ctx.collectionName,
                    filter: { operator: '$eq', fieldName: '_id', value: ctx.numberItem._id },
                    aggregation: {
                        processingStep: {
                            _id: {
                                field1: '_id',
                                field2: '_owner',
                            },
                            myAvg: {
                                $avg: ctx.numberColumns[0].name
                            },
                            mySum: {
                                $sum: ctx.numberColumns[1].name
                            }
                        },
                        postFilteringStep: {
                            operator: '$and', value: [
                                {operator: '$gt', fieldName: 'myAvg', value: 0},
                                {operator: '$gt', fieldName: 'mySum', value: 0}

                            ],
                        },
                    }
                }, authAdmin)).data).toEqual({ items: [ { _id: ctx.numberItem._id, _owner: ctx.numberItem._owner, myAvg: ctx.numberItem[ctx.numberColumns[0].name], mySum: ctx.numberItem[ctx.numberColumns[1].name] } ],
                totalCount: 0});
        })
    }

        test('delete one api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

            await axios.post(`/data/remove`, {collectionName: ctx.collectionName, itemId: ctx.item._id }, authAdmin)

            expect(await data.expectAllDataIn(ctx.collectionName, authAdmin)).toEqual({ items: [ ], totalCount: 0})
        })

        test('bulk delete api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

            await axios.post(`/data/remove/bulk`, {collectionName: ctx.collectionName, itemIds: ctx.items.map(i => i._id) }, authAdmin)

            expect(await data.expectAllDataIn(ctx.collectionName, authAdmin)).toEqual({ items: [ ], totalCount: 0})
        })

        test('get by id api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

            expect((await axios.post(`/data/get`, {collectionName: ctx.collectionName, itemId: ctx.item._id}, authAdmin)).data).toEqual({ item: ctx.item });
        })

        test('update api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item], ctx.collectionName, authAdmin)

            await axios.post(`/data/update`, {collectionName: ctx.collectionName, item: ctx.modifiedItem }, authAdmin)

            expect(await data.expectAllDataIn(ctx.collectionName, authAdmin)).toEqual({ items: [ctx.modifiedItem], totalCount: 0});
        })

        test('bulk update api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems(ctx.items, ctx.collectionName, authAdmin)

            await axios.post(`/data/update/bulk`, {collectionName: ctx.collectionName, items: ctx.modifiedItems }, authAdmin)

            expect((await data.expectAllDataIn(ctx.collectionName, authAdmin)).items).toEqual(expect.arrayContaining(ctx.modifiedItems));
        })

        test('count api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)

            expect((await axios.post(`/data/count`, {collectionName: ctx.collectionName, filter: '' }, authAdmin)).data).toEqual({ totalCount: 2});
        })

        test('truncate api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, authAdmin)

            await axios.post(`/data/truncate`, {collectionName: ctx.collectionName }, authAdmin)

            expect(await data.expectAllDataIn(ctx.collectionName, authAdmin)).toEqual({ items: [ ], totalCount: 0})
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
    }

    afterAll(async () => await teardownApp())

    beforeEach(async () => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.item = gen.randomEntity([ctx.column.name])
        ctx.items = Array.from({length: 10}, () => gen.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map(i => ( { ...i, [ctx.column.name]: chance.word() } ) )
        ctx.modifiedItem = { ...ctx.item, [ctx.column.name]: chance.word() }
        ctx.anotherItem = gen.randomEntity([ctx.column.name])
        ctx.numberItem = gen.randomNumberDbEntity(ctx.numberColumns)
        ctx.anotherNumberItem = gen.randomNumberDbEntity(ctx.numberColumns)
    });
})
