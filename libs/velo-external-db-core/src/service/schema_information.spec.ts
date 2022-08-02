import { Uninitialized } from '@wix-velo/test-commons'
import SchemaInformation from './schema_information'
import * as driver from '../../test/drivers/schema_provider_test_support'
import * as gen from '../../test/gen'
import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists } = errors

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

    interface Enviorment {
        schemaInformation: SchemaInformation
    }
    
    const env: Enviorment = {
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
