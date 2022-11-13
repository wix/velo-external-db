import * as Chance from 'chance'
import SchemaService from './schema'
import { AllSchemaOperations, errors } from '@wix-velo/velo-external-db-commons'
import { Uninitialized } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/schema_provider_test_support'
import * as schema from '../../test/drivers/schema_information_test_support'
import * as matchers from '../../test/drivers/schema_matchers'
import * as gen from '../../test/gen'
const { schemasListFor, schemaHeadersListFor, schemasWithReadOnlyCapabilitiesFor, collectionsListFor } = matchers
const chance = Chance()

describe('Schema Service', () => {

    test('retrieve all collections from provider', async() => {
        driver.givenAllSchemaOperations()
        driver.givenListResult(ctx.dbsWithIdColumn)

        await expect( env.schemaService.list() ).resolves.toEqual( schemasListFor(ctx.dbsWithIdColumn, AllSchemaOperations) )
    })

    test('retrieve short list of all collections from provider', async() => {
        driver.givenListHeadersResult(ctx.collections)


        await expect( env.schemaService.listHeaders() ).resolves.toEqual( schemaHeadersListFor(ctx.collections) )
    })

    test('retrieve collections by ids from provider', async() => {
        driver.givenAllSchemaOperations()
        schema.givenSchemaFieldsResultFor(ctx.dbsWithIdColumn)

        await expect( env.schemaService.find(ctx.dbsWithIdColumn.map((db: { id: any }) => db.id)) ).resolves.toEqual( schemasListFor(ctx.dbsWithIdColumn, AllSchemaOperations) )
    })

    test('create collection name', async() => {
        driver.givenAllSchemaOperations()
        driver.expectCreateOf(ctx.collectionName)
        schema.expectSchemaRefresh()

        await expect(env.schemaService.create(ctx.collectionName)).resolves.toEqual({})
    })

    test('add column for collection name', async() => {
        driver.givenAllSchemaOperations()
        driver.expectCreateColumnOf(ctx.column, ctx.collectionName)
        schema.expectSchemaRefresh()

        await expect(env.schemaService.addColumn(ctx.collectionName, ctx.column)).resolves.toEqual({})
    })

    test('remove column from collection name', async() => {
        driver.givenAllSchemaOperations()
        driver.expectRemoveColumnOf(ctx.column, ctx.collectionName)
        schema.expectSchemaRefresh()

        await expect(env.schemaService.removeColumn(ctx.collectionName, ctx.column.name)).resolves.toEqual({})
    })

    test('collections without _id column will have read-only capabilities', async() => {
        driver.givenAllSchemaOperations()
        driver.givenListResult(ctx.dbsWithoutIdColumn)

        await expect( env.schemaService.list() ).resolves.toEqual( schemasWithReadOnlyCapabilitiesFor(ctx.dbsWithoutIdColumn) )
    })

    test('run unsupported operations should throw', async() => {
        driver.givenAdapterSupportedOperationsWith(ctx.invalidOperations)

        await expect(env.schemaService.create(ctx.collectionName)).rejects.toThrow(errors.UnsupportedOperation)
        await expect(env.schemaService.addColumn(ctx.collectionName, ctx.column)).rejects.toThrow(errors.UnsupportedOperation)
        await expect(env.schemaService.removeColumn(ctx.collectionName, ctx.column.name)).rejects.toThrow(errors.UnsupportedOperation)
    })

    test('retrieve all collections from provider with listAllCollections', async() => {
        driver.givenAllSchemaOperations()
        driver.givenColumnCapabilities()
        driver.givenListResult(ctx.dbsWithIdColumn)
        

        await expect( env.schemaService.listCollections([]) ).resolves.toEqual( collectionsListFor(ctx.dbsWithIdColumn)  )
    })
    
    const ctx = {
        dbsWithoutIdColumn: Uninitialized,
        dbsWithIdColumn: Uninitialized,
        collections: Uninitialized,
        collectionName: Uninitialized,
        column: Uninitialized,
        invalidOperations: Uninitialized,
    }

    interface Enviorment {
        schemaService: SchemaService
    }

    const env: Enviorment = {
        schemaService: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        schema.reset()

        ctx.dbsWithoutIdColumn = gen.randomDbs()
        ctx.dbsWithIdColumn = gen.randomDbsWithIdColumn()

        ctx.collections = gen.randomCollections()
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()

        ctx.invalidOperations = [chance.word(), chance.word()]
        
        env.schemaService = new SchemaService(driver.schemaProvider, schema.schemaInformation)
    })
})
