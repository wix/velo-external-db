const { Uninitialized, gen } = require('test-commons')
const schema = require('../drivers/schema_api_rest_test_support');
const { auth } = require('../drivers/auth-test-support')
const Chance = require('chance')
const each = require('jest-each').default
const { initApp, teardownApp, postgresTestEnvInit, dbTeardown, mysqlTestEnvInit} = require('../resources/e2e_resources')
const chance = Chance();

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});

afterAll(async () => {
    await teardownApp()
}, 20000);

describe('Velo External DB Schema REST API',  () => {
    each([
        ['MySql', mysqlTestEnvInit],
        ['Postgres', postgresTestEnvInit],
    ]).describe('%s', (name, setup, teardown) => {
        beforeAll(async () => {
            await setup()

            initApp()
        }, 20000);

        afterAll(async () => {
            await dbTeardown()
        }, 20000);

        test('list', async () => {
            expect((await axios.post(`/schemas/list`, {}, auth)).data).toEqual({ schemas: []});
        })

        test('create', async () => {
            await schema.givenCollection(ctx.collectionName, [], auth)

            const res = await axios.post(`/schemas/list`, {}, auth)
            schema.expectDefaultCollectionWith(ctx.collectionName, res)
        })

        test('find', async () => {
            await schema.givenCollection(ctx.collectionName, [], auth)

            const res = await axios.post(`/schemas/find`, { schemaIds: [ctx.collectionName]}, auth)
            schema.expectDefaultCollectionWith(ctx.collectionName, res)
        })

        test('add column', async () => {
            await schema.givenCollection(ctx.collectionName, [], auth)

            await axios.post(`/schemas/column/add`, {collectionName: ctx.collectionName, column: ctx.column}, auth)

            const field = await schema.expectColumnInCollection(ctx.column.name, ctx.collectionName, auth)
            expect(field).toEqual({displayName: ctx.column.name,
                type: 'text',
                queryOperators: [
                    "eq",
                    "lt",
                    "gt",
                    "hasSome",
                    "and",
                    "lte",
                    "gte",
                    "or",
                    "not",
                    "ne",
                    "startsWith",
                    "endsWith",
                ]})
        })

        test('remove column', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)

            await axios.post(`/schemas/column/remove`, {collectionName: ctx.collectionName, columnName: ctx.column.name}, auth)

            const field = await schema.expectColumnInCollection(ctx.column.name, ctx.collectionName, auth)
            expect(field).toBeUndefined()
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

    beforeEach(async () => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.item = gen.randomEntity([ctx.column.name])
        ctx.items = Array.from({length: 10}, () => gen.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map(i => Object.assign({}, i, {[ctx.column.name]: chance.word()} ) )
        ctx.modifiedItem = Object.assign({}, ctx.item, {[ctx.column.name]: chance.word()} )
        ctx.anotherItem = gen.randomEntity([ctx.column.name])
        ctx.numberItem = gen.randomNumberDbEntity(ctx.numberColumns)
        ctx.anotherNumberItem = gen.randomNumberDbEntity(ctx.numberColumns)
    });

})
