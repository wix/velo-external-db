const { Uninitialized } = require('test-commons')
const SchemaInformation = require('./schema_information')
const driver = require('../../test/drivers/schema_provider_test_support')
const gen = require('../../test/gen')
const { CollectionDoesNotExists } = require('velo-external-db-commons').errors

describe('Schema Information Service', () => {

    test('will automatically refresh and return schema for collection when queried', async() => {
        driver.givenFindResults(ctx.dbs)

        await expect( env.schemaInformation.schemaFieldsFor(ctx.dbs[0].id) ).resolves.toEqual(ctx.dbs[0].fields)
    })

    test('will automatically refresh and return schema fields for collection when queried', async() => {
        driver.givenFindResults(ctx.dbs)

        await expect( env.schemaInformation.schemaFieldsFor(ctx.dbs[0].id) ).resolves.toEqual(ctx.dbs[0].fields)
    })

    test('retrieve collection fields if it does not exists, throw an exception', async() => {
        driver.givenFindResults([])

        await expect(env.schemaInformation.schemaFieldsFor(ctx.collectionName)).rejects.toThrow(CollectionDoesNotExists)
    })

    test('force refresh will invalidate cache', async() => {
        driver.givenListResult([])
        await env.schemaInformation.refresh()
        driver.givenListResult(ctx.dbs)

        await env.schemaInformation.refresh()

        await expect( env.schemaInformation.schemaFieldsFor(ctx.dbs[0].id) ).resolves.toEqual(ctx.dbs[0].fields)
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
        env.schemaInformation.clear()

        ctx.dbs = gen.randomDbs()
        ctx.collectionName = gen.randomCollectionName()
    })
})