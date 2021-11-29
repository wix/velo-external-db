const { Uninitialized, gen } = require('test-commons')
const schema = require('../drivers/schema_api_rest_test_support')
const { authOwner } = require('../drivers/auth_test_support')
const Chance = require('chance')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, testSuits } = require('../resources/e2e_resources')
const chance = Chance()

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe('Velo External DB Schema REST API',  () => {
    each(testSuits()).describe('%s', (name, setup) => {
        beforeAll(async() => {
            await setup()

            await initApp()
        }, 20000)

        afterAll(async() => {
            await dbTeardown()
        }, 20000)

        test('list', async() => {
            expect((await axios.post('/schemas/list', {}, authOwner)).data).toEqual({ schemas: [] })
        })

        // eslint-disable-next-line jest/expect-expect
        test('create', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)

            const res = await axios.post('/schemas/list', {}, authOwner)
            schema.expectDefaultCollectionWith(ctx.collectionName, res)
        })

        // eslint-disable-next-line jest/expect-expect
        test('find', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)

            const res = await axios.post('/schemas/find', { schemaIds: [ctx.collectionName] }, authOwner)
            schema.expectDefaultCollectionWith(ctx.collectionName, res)
        })

        test('add column', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)

            await axios.post('/schemas/column/add', { collectionName: ctx.collectionName, column: ctx.column }, authOwner)

            const field = await schema.expectColumnInCollection(ctx.column.name, ctx.collectionName, authOwner)
            expect(field).toEqual({ displayName: ctx.column.name,
                type: 'text',
                queryOperators: [
                    'eq',
                    'lt',
                    'gt',
                    'hasSome',
                    'and',
                    'lte',
                    'gte',
                    'or',
                    'not',
                    'ne',
                    'startsWith',
                    'endsWith',
                ] })
        })

        test('remove column', async() => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

            await axios.post('/schemas/column/remove', { collectionName: ctx.collectionName, columnName: ctx.column.name }, authOwner)

            const field = await schema.expectColumnInCollection(ctx.column.name, ctx.collectionName, authOwner)
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
