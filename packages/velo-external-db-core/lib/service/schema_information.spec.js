const { Uninitialized, gen } = require('test-commons')
const SchemaInformation = require('./schema_information')
const driver = require('../../test/drivers/schema_provider_test_support')
const { CollectionDoesNotExists } = require('velo-external-db-commons').errors

describe('Schema Information Service', () => {

    test('will automatically refresh and return schema for collection when queried', async() => {
        driver.givenListResult(ctx.dbs)

        await expect( env.schemaInformation.schemaFor(ctx.dbs[0].id) ).resolves.toEqual(ctx.dbs[0])
    })

    test('retrieve collection if it does not exists, throw an exception', async() => {
        driver.givenListResult([])

        await expect( env.schemaInformation.schemaFor(ctx.collectionName) ).rejects.toThrow(CollectionDoesNotExists)
    })

    test('force refresh will invalidate cache', async() => {
        driver.givenListResult([])
        await env.schemaInformation.refresh()
        driver.givenListResult(ctx.dbs)

        await env.schemaInformation.refresh()

        await expect( env.schemaInformation.schemaFor(ctx.dbs[0].id) ).resolves.toEqual(ctx.dbs[0])
    })

    const ctx = {
        dbs: Uninitialized,
        collectionName: Uninitialized,
    }

    const env = {
        schemaInformation: Uninitialized,
    }

    beforeAll(() => {
        env.schemaInformation = new SchemaInformation(driver.schemaProvider)
    })

    beforeEach(() => {
        driver.reset()

        ctx.dbs = gen.randomDbs()
        ctx.collectionName = gen.randomCollectionName()
    })
})