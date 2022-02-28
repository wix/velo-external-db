const { Uninitialized, gen: genCommon, shouldNotRunOn } = require('test-commons')
const schema = require('../drivers/schema_api_rest_test_support')
const matchers = require('../drivers/schema_api_rest_matchers')
const { authOwner } = require('../drivers/auth_test_support')
const gen = require('../gen')
const Chance = require('chance')
const { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } = require('../resources/e2e_resources')
const chance = Chance()

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB Schema REST API: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        await setupDb()

        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    test('list', async() => {
        await expect( axios.post('/schemas/list', {}, authOwner) ).resolves.toEqual( matchers.collectionResponseWithNoCollections() )
    })

    test('list headers', async() => {
        await schema.givenCollection(ctx.collectionName, [], authOwner)

        await expect( axios.post('/schemas/list/headers', {}, authOwner) ).resolves.toEqual( matchers.collectionResponseWithCollections([ctx.collectionName]) )
    })

    test('create', async() => {
        await axios.post('/schemas/create', { collectionName: ctx.collectionName }, authOwner)

        await expect( schema.retrieveSchemaFor(ctx.collectionName, authOwner) ).resolves.toEqual( matchers.collectionResponseWithDefaultFieldsFor(ctx.collectionName) )
    })

    test('find', async() => {
        await schema.givenCollection(ctx.collectionName, [], authOwner)

        await expect( axios.post('/schemas/find', { schemaIds: [ctx.collectionName] }, authOwner)).resolves.toEqual( matchers.collectionResponseWithDefaultFieldsFor(ctx.collectionName) )
    })

    test('add column', async() => {
        await schema.givenCollection(ctx.collectionName, [], authOwner)

        await axios.post('/schemas/column/add', { collectionName: ctx.collectionName, column: ctx.column }, authOwner)

        await expect( schema.retrieveSchemaFor(ctx.collectionName, authOwner) ).resolves.toEqual( matchers.collectionResponseHasField( ctx.column ) )
    })

    if (shouldNotRunOn(['Google-sheet'], currentDbImplementationName())) {
        test('remove column', async() => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

            await axios.post('/schemas/column/remove', { collectionName: ctx.collectionName, columnName: ctx.column.name }, authOwner)

            await expect( schema.retrieveSchemaFor(ctx.collectionName, authOwner) ).resolves.not.toEqual( matchers.collectionResponseHasField( ctx.column ) )
        })
    }


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
        ctx.item = genCommon.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name]))
        ctx.modifiedItems = ctx.items.map(i => ( { ...i, [ctx.column.name]: chance.word() } ) )
        ctx.modifiedItem = { ...ctx.item, [ctx.column.name]: chance.word() }
        ctx.anotherItem = genCommon.randomEntity([ctx.column.name])
        ctx.numberItem = gen.randomNumberDbEntity(ctx.numberColumns)
        ctx.anotherNumberItem = gen.randomNumberDbEntity(ctx.numberColumns)
    })

})
