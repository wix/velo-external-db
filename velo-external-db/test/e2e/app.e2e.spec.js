const mysql = require('../resources/mysql_resources');
const { Uninitialized } = require('../commons/test-commons');
const schema = require('../drivers/schema_api_rest_test_support');
const data = require('../drivers/data_api_rest_test_support');
const gen = require('../drivers/gen');
const { authInit, auth } = require('../drivers/auth-test-support')
const Chance = require('chance')
const chance = Chance();


const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


describe('Velo External DB', function () {
    test('answer default page with a welcoming response', async () => {
        expect((await axios.get(`/`)).data).toContain('<!doctype html>');
    })

    test('answer provision with stub response', async () => {
        expect((await axios.post(`/provision`, {}, auth)).data).toEqual({});
    })

    describe('Schema API', () => {

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

    describe('Data API', () => {

        test('find api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, auth)

            expect((await axios.post(`/data/find`, {collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 }, auth)).data).toEqual({ items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                                                                                                                                                                                              totalCount: 0});
        })

        test('delete one api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)
            await data.givenItems([ctx.item], ctx.collectionName, auth)

            await axios.post(`/data/remove`, {collectionName: ctx.collectionName, itemId: ctx.item._id }, auth)

            expect(await data.expectAllDataIn(ctx.collectionName, auth)).toEqual({ items: [ ], totalCount: 0})
        })

        test('get by id api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)
            await data.givenItems([ctx.item], ctx.collectionName, auth)

            expect((await axios.post(`/data/get`, {collectionName: ctx.collectionName, itemId: ctx.item._id}, auth)).data).toEqual({ item: ctx.item });
        })

        test('update api e2e', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)
            await data.givenItems([ctx.item], ctx.collectionName, auth)

            await axios.post(`/data/update`, {collectionName: ctx.collectionName, item: ctx.modifiedItem }, auth)

            expect(await data.expectAllDataIn(ctx.collectionName, auth)).toEqual({ items: [ctx.modifiedItem], totalCount: 0});
        })

        test('count api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, auth)

            expect((await axios.post(`/data/count`, {collectionName: ctx.collectionName, filter: '' }, auth)).data).toEqual({ totalCount: 2});
        })

        test('truncate api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], auth)
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName, auth)

            await axios.post(`/data/truncate`, {collectionName: ctx.collectionName }, auth)

            expect(await data.expectAllDataIn(ctx.collectionName, auth)).toEqual({ items: [ ], totalCount: 0})
        })
    })


    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        item: Uninitialized,
        modifiedItem: Uninitialized,
        anotherItem: Uninitialized,
    }

    const env = {
        secretKey: Uninitialized,
        server: Uninitialized,
    }

    beforeEach(async () => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.item = gen.randomEntity([ctx.column.name])
        ctx.modifiedItem = Object.assign({}, ctx.item, {[ctx.column.name]: chance.word()} )
        ctx.anotherItem = gen.randomEntity([ctx.column.name])
    });

    beforeAll(async function() {
        await mysql.initMySqlEnv()

        authInit()

        env.server = require('../..')
    });

    afterAll(async () => {
        await env.server.close()
        await mysql.shutdownMySqlEnv();
    });
})
