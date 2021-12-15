const SchemaService = require('./schema')
const { asWixSchema } = require('velo-external-db-commons')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/schema_provider_test_support')
const schema = require('../../test/drivers/schema_information_test_support')

describe('Schema Service', () => {

    test('retrieve all collections from provider', async() => {
        driver.givenListResult(ctx.dbs)

        const actual = await env.schemaService.list()
        expect( actual ).toEqual({ schemas: ctx.dbs.map(db => asWixSchema(db.fields, db.id)) })
    })

    test('retrieve collections by ids from provider', async() => {
        driver.givenFindResults(ctx.dbs)

        const actual = await env.schemaService.find(ctx.dbs.map(db => db.id))
        expect( actual ).toEqual({ schemas: ctx.dbs.map(db => asWixSchema(db.fields, db.id)) })
    })

    // eslint-disable-next-line jest/expect-expect
    test('create collection name', async() => {
        driver.expectCreateOf(ctx.collectionName)
        schema.expectSchemaRefresh()

        await env.schemaService.create(ctx.collectionName)
    })

    // eslint-disable-next-line jest/expect-expect
    test('add column for collection name', async() => {
        driver.expectCreateColumnOf(ctx.column, ctx.collectionName)
        schema.expectSchemaRefresh()

        await env.schemaService.addColumn(ctx.collectionName, ctx.column)
    })

    // eslint-disable-next-line jest/expect-expect
    test('remove column from collection name', async() => {
        driver.expectRemoveColumnOf(ctx.column, ctx.collectionName)
        schema.expectSchemaRefresh()

        await env.schemaService.removeColumn(ctx.collectionName, ctx.column.name)
    })

    const ctx = {
        dbs: Uninitialized,
        collectionName: Uninitialized,
        column: Uninitialized,
    }

    const env = {
        schemaService: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        schema.reset()

        ctx.dbs = gen.randomDbs2()
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()

        env.schemaService = new SchemaService(driver.schemaProvider, schema.schemaInformation)
    })
})