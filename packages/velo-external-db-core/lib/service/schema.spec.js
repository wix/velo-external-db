const SchemaService = require('./schema')
const { asWixSchema, asWixSchemaHeaders, prepareDbsList } = require('velo-external-db-commons')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/schema_provider_test_support')
const schema = require('../../test/drivers/schema_information_test_support')

describe('Schema Service', () => {

    test('retrieve all collections from provider', async() => {
        driver.givenListResult(ctx.dbs)
        driver.givenSupportedOperations(ctx.schemaOperations)

        const actual = await env.schemaService.list()
        expect( actual ).toEqual({ schemas: prepareDbsList(ctx.dbs, ctx.schemaOperations).map( asWixSchema ) })
    })

    test('retrieve short list of all collections from provider', async() => {
        driver.givenListHeadersResult(ctx.collections)

        const actual = await env.schemaService.listHeaders()
        expect( actual ).toEqual({ schemas: ctx.collections.map( asWixSchemaHeaders ) })
    })

    test('retrieve collections by ids from provider', async() => {
        driver.givenFindResults(ctx.dbs)
        driver.givenSupportedOperations(ctx.schemaOperations)

        const actual = await env.schemaService.find(ctx.dbs.map(db => db.id))
        expect( actual ).toEqual({ schemas: prepareDbsList(ctx.dbs, ctx.schemaOperations).map( asWixSchema ) })
    })

    test('create collection name', async() => {
        driver.expectCreateOf(ctx.collectionName)
        schema.expectSchemaRefresh()

        await expect(env.schemaService.create(ctx.collectionName)).resolves.toEqual({})
    })

    test('add column for collection name', async() => {
        driver.expectCreateColumnOf(ctx.column, ctx.collectionName)
        schema.expectSchemaRefresh()

        await expect(env.schemaService.addColumn(ctx.collectionName, ctx.column)).resolves.toEqual({})
    })

    test('remove column from collection name', async() => {
        driver.expectRemoveColumnOf(ctx.column, ctx.collectionName)
        schema.expectSchemaRefresh()

        await expect(env.schemaService.removeColumn(ctx.collectionName, ctx.column.name)).resolves.toEqual({})
    })

    const ctx = {
        dbs: Uninitialized,
        collections: Uninitialized,
        collectionName: Uninitialized,
        column: Uninitialized,
        schemaOperations: Uninitialized,
    }

    const env = {
        schemaService: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        schema.reset()

        ctx.dbs = gen.randomDbs()
        ctx.collections = gen.randomCollections()
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.schemaOperations = gen.randomSchemaOperations()

        env.schemaService = new SchemaService(driver.schemaProvider, schema.schemaInformation)
    })
})