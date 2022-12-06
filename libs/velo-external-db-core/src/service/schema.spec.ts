import * as Chance from 'chance'
import SchemaService from './schema'
import { AllSchemaOperations, errors } from '@wix-velo/velo-external-db-commons'
import { Uninitialized } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/schema_provider_test_support'
import * as schema from '../../test/drivers/schema_information_test_support'
import * as matchers from '../../test/drivers/schema_matchers'
import * as gen from '../../test/gen'
import { convertFieldTypeToEnum } from '../utils/schema_utils'
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

    describe('Collection new SPI', () => {
        test('retrieve all collections from provider', async() => {
            const collectionCapabilities = {
                dataOperations: [],
                fieldTypes: [],
                collectionOperations: [],
            }
            
            driver.givenAllSchemaOperations()
            driver.givenCollectionCapabilities(collectionCapabilities)
            driver.givenColumnCapabilities()
            driver.givenListResult(ctx.dbsWithIdColumn)
            

            await expect( env.schemaService.listCollections([]) ).resolves.toEqual( collectionsListFor(ctx.dbsWithIdColumn, collectionCapabilities))
        })

        test('create new collection without fields', async() => {
            driver.givenAllSchemaOperations()
            driver.expectCreateOf(ctx.collectionName)
            schema.expectSchemaRefresh()

            await expect(env.schemaService.createCollection({ id: ctx.collectionName, fields: [] })).resolves.toEqual({
                collection: { id: ctx.collectionName, fields: [] } 
            })
        })

        test('create new collection with fields', async() => {
            const fields = [{
                key: ctx.column.name,
                type: convertFieldTypeToEnum(ctx.column.type),
            }]
            driver.givenAllSchemaOperations()
            schema.expectSchemaRefresh()            
            driver.expectCreateWithFieldsOf(ctx.collectionName, fields)
    
            await expect(env.schemaService.createCollection({ id: ctx.collectionName, fields })).resolves.toEqual({
                collection: { id: ctx.collectionName, fields }
            })
        })

        test('compareColumnsInDbAndRequest function - add columns', async() => {
            const { compareColumnsInDbAndRequest } = env.schemaService
            const columnsInDb = [{
                field: ctx.column.name,
                type: ctx.column.type
            }]
            const columnsInRequest = [{
                key: ctx.column.name,
                type: convertFieldTypeToEnum(ctx.column.type),
            }]
            const newColumn = {
                key: ctx.anotherColumn.name,
                type: convertFieldTypeToEnum(ctx.anotherColumn.type)
            }
            expect(compareColumnsInDbAndRequest([], []).columnsToAdd).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, columnsInRequest).columnsToAdd).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, []).columnsToAdd).toEqual([])
            expect(compareColumnsInDbAndRequest([], columnsInRequest).columnsToAdd).toEqual([...columnsInRequest])
            expect(compareColumnsInDbAndRequest(columnsInDb, [...columnsInRequest, newColumn]).columnsToAdd).toEqual([newColumn])
        })

        test('compareColumnsInDbAndRequest function - remove columns', async() => {
            const { compareColumnsInDbAndRequest } = env.schemaService
            const columnsInDb = [{
                field: ctx.column.name,
                type: ctx.column.type
            }]
            const columnsInRequest = [{
                key: ctx.column.name,
                type: convertFieldTypeToEnum(ctx.column.type),
            }]
            const newColumn = {
                key: ctx.anotherColumn.name,
                type: convertFieldTypeToEnum(ctx.anotherColumn.type)
            }
            expect(compareColumnsInDbAndRequest([], []).columnsToRemove).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, columnsInRequest).columnsToRemove).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, [...columnsInRequest, newColumn]).columnsToRemove).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, []).columnsToRemove).toEqual([...columnsInDb])
            expect(compareColumnsInDbAndRequest(columnsInDb, [newColumn]).columnsToRemove).toEqual(columnsInDb)
        })

        test('compareColumnsInDbAndRequest function - change column type', async() => {
            const { compareColumnsInDbAndRequest } = env.schemaService
            const columnsInDb = [{
                field: ctx.column.name,
                type: 'text'
            }]

            const columnsInRequest = [{
                key: ctx.column.name,
                type: convertFieldTypeToEnum('text'),
            }]

            const changedColumnType = {
                key: ctx.column.name,
                type: convertFieldTypeToEnum('number')
            }

            expect(compareColumnsInDbAndRequest([], []).columnsToChangeType).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, columnsInRequest).columnsToChangeType).toEqual([])
            expect(compareColumnsInDbAndRequest(columnsInDb, [changedColumnType]).columnsToChangeType).toEqual([changedColumnType])

        })

    })
    
    const ctx = {
        dbsWithoutIdColumn: Uninitialized,
        dbsWithIdColumn: Uninitialized,
        collections: Uninitialized,
        collectionName: Uninitialized,
        column: Uninitialized,
        anotherColumn: Uninitialized,
        invalidOperations: Uninitialized,
    }

    interface Environment {
        schemaService: SchemaService
    }

    const env: Environment = {
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
        ctx.anotherColumn = gen.randomColumn()

        ctx.invalidOperations = [chance.word(), chance.word()]
        
        env.schemaService = new SchemaService(driver.schemaProvider, schema.schemaInformation)
    })
})
