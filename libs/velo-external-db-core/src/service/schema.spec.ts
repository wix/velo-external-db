import * as Chance from 'chance'
import { Uninitialized } from '@wix-velo/test-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import SchemaService from './schema'
import * as driver from '../../test/drivers/schema_provider_test_support'
import * as schema from '../../test/drivers/schema_information_test_support'
import * as matchers from '../../test/drivers/schema_matchers'
import * as gen from '../../test/gen'
import { 
    fieldTypeToWixDataEnum, 
    compareColumnsInDbAndRequest,
    InputFieldsToWixFormatFields,
    InputFieldToWixFormatField,
} from '../utils/schema_utils'
import { 
    Table,
    InputField
 } from '@wix-velo/velo-external-db-types'
 
const { collectionsListFor } = matchers
const chance = Chance()

describe('Schema Service', () => {
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


            await expect( env.schemaService.list([]) ).resolves.toEqual(collectionsListFor(ctx.dbsWithIdColumn, collectionCapabilities))
        })

        test('create new collection without fields', async() => {
            driver.givenAllSchemaOperations()
            driver.expectCreateOf(ctx.collectionName)
            schema.expectSchemaRefresh()

            await expect(env.schemaService.create({ id: ctx.collectionName, fields: [] })).resolves.toEqual({
                collection: { id: ctx.collectionName, fields: [] } 
            })
        })

        test('create new collection with fields', async() => {
            const fields = [{
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum(ctx.column.type),
            }]
            driver.givenAllSchemaOperations()
            schema.expectSchemaRefresh()            
            driver.expectCreateWithFieldsOf(ctx.collectionName, fields)
    
            await expect(env.schemaService.create({ id: ctx.collectionName, fields })).resolves.toEqual({
                collection: { id: ctx.collectionName, fields }
            })
        })

        test('update collection - add new columns', async() => { 
            const newFields = [{
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum(ctx.column.type),
            }]

            driver.givenAllSchemaOperations()
            schema.expectSchemaRefresh()            
            driver.givenFindResults([ { id: ctx.collectionName, fields: [] } ])

            await env.schemaService.update({ id: ctx.collectionName, fields: newFields })


            expect(driver.schemaProvider.addColumn).toBeCalledTimes(1)    
            expect(driver.schemaProvider.addColumn).toBeCalledWith(ctx.collectionName, {
                name: ctx.column.name,
                type: ctx.column.type,
                subtype: ctx.column.subtype 
            })    
            expect(driver.schemaProvider.removeColumn).not.toBeCalled()
            expect(driver.schemaProvider.changeColumnType).not.toBeCalled()
        })

        test('update collection - add new column to non empty collection', async() => {
            const currentFields = [{
                field: ctx.column.name,
                type: ctx.column.type
            }]
            const wantedFields = InputFieldsToWixFormatFields([ ctx.column, ctx.anotherColumn ])

            driver.givenAllSchemaOperations()
            schema.expectSchemaRefresh()            
            driver.givenFindResults([ {
                id: ctx.collectionName,
                fields: currentFields
            }])

            await env.schemaService.update({ id: ctx.collectionName, fields: wantedFields })

            const { columnsToAdd } = compareColumnsInDbAndRequest(currentFields, wantedFields)

            columnsToAdd.forEach(c => expect(driver.schemaProvider.addColumn).toBeCalledWith(ctx.collectionName, c))
            expect(driver.schemaProvider.removeColumn).not.toBeCalled()   
            expect(driver.schemaProvider.changeColumnType).not.toBeCalled()
        })

        test('update collection - remove column', async() => {
            const currentFields = [{
                field: ctx.column.name,
                type: ctx.column.type
            }]

            driver.givenAllSchemaOperations()
            schema.expectSchemaRefresh()            
            driver.givenFindResults([ {
                id: ctx.collectionName,
                fields: currentFields
            }])

            const { columnsToRemove } = compareColumnsInDbAndRequest(currentFields, [])

            await env.schemaService.update({ id: ctx.collectionName, fields: [] })

            columnsToRemove.forEach(c => expect(driver.schemaProvider.removeColumn).toBeCalledWith(ctx.collectionName, c))
            expect(driver.schemaProvider.addColumn).not.toBeCalled()
            expect(driver.schemaProvider.changeColumnType).not.toBeCalled()

        })

        test('update collection - change column type', async() => {
            const currentField = {
                field: ctx.column.name,
                type: 'text'
            }

            const changedColumnType = {
                key: ctx.column.name,
                type: fieldTypeToWixDataEnum('number')
            }

            driver.givenAllSchemaOperations()
            schema.expectSchemaRefresh()            
            driver.givenFindResults([ {
                id: ctx.collectionName,
                fields: [currentField]
            }])

            const { columnsToChangeType } = compareColumnsInDbAndRequest([currentField], [changedColumnType])

            await env.schemaService.update({ id: ctx.collectionName, fields: [changedColumnType] })
            
            columnsToChangeType.forEach(c => expect(driver.schemaProvider.changeColumnType).toBeCalledWith(ctx.collectionName, c))
            expect(driver.schemaProvider.addColumn).not.toBeCalled()
            expect(driver.schemaProvider.removeColumn).not.toBeCalled()

        })

        // TODO: create a test for the case
        // test('collections without _id column will have read-only capabilities', async() => {})

        //TODO: create a test for the case
        test('run unsupported operations should throw', async() => {
            schema.expectSchemaRefresh()         
            driver.givenAdapterSupportedOperationsWith(ctx.invalidOperations)
            const field = InputFieldToWixFormatField({
                name: ctx.column.name,
                type: 'text'
            })
            const changedTypeField = InputFieldToWixFormatField({
                name: ctx.column.name,
                type: 'number'
            })
        
            driver.givenFindResults([ { id: ctx.collectionName, fields: [] } ])

            await expect(env.schemaService.update({ id: ctx.collectionName, fields: [field] })).rejects.toThrow(errors.UnsupportedOperation)

            driver.givenFindResults([ { id: ctx.collectionName, fields: [{ field: ctx.column.name, type: 'text' }] }])

            await expect(env.schemaService.update({ id: ctx.collectionName, fields: [] })).rejects.toThrow(errors.UnsupportedOperation)
            await expect(env.schemaService.update({ id: ctx.collectionName, fields: [changedTypeField] })).rejects.toThrow(errors.UnsupportedOperation)


        })

    })

    interface Ctx {
        dbsWithoutIdColumn: Table[],
        dbsWithIdColumn: Table[],
        collections: string[],
        collectionName: string,
        column: InputField,
        anotherColumn: InputField,
        invalidOperations: string[],
    }
    
    
    const ctx: Ctx = {
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
