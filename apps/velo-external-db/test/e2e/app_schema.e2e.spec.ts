import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { Uninitialized, gen as genCommon, testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import { InputField, SchemaOperations } from '@wix-velo/velo-external-db-types'
const { RemoveColumn, ChangeColumnType } = SchemaOperations
import * as schema from '../drivers/schema_api_rest_test_support'
import * as data from '../drivers/data_api_rest_test_support'
import * as matchers from '../drivers/schema_api_rest_matchers'
import { schemaUtils } from '@wix-velo/velo-external-db-core'
import { authOwner, collectionChangeNotSupportedErrorResponseWith } from '@wix-velo/external-db-testkit'
import * as gen from '../gen'
import Chance = require('chance')
import axios from 'axios'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations, env } from '../resources/e2e_resources'
const chance = Chance()

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/v3'
})

describe(`Schema REST API: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        await setupDb()

        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)
    
    describe('Velo External DB Collections REST API',  () => {
        beforeEach(async() => {
            await schema.deleteAllCollections(authOwner)
        })

        test('collection get - retrieve a certain collection', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)

            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.collectionResponsesWith(ctx.collectionName, [...SystemFields], env.capabilities))
        })

        test('collection get - retrieve all collections', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)
            await schema.givenCollection(ctx.anotherCollectionName, [], authOwner)

            await expect(schema.retrieveAllCollections(authOwner)).resolves.toEqual(expect.arrayContaining([
                matchers.collectionResponsesWith(ctx.collectionName, [...SystemFields], env.capabilities),
                matchers.collectionResponsesWith(ctx.anotherCollectionName, [...SystemFields], env.capabilities)
            ]))
        })

        test('collection create - collection without fields', async() => {   
            const collection = {
                id: ctx.collectionName,
                fields: schemaUtils.InputFieldsToWixFormatFields(SystemFields)
            }
            await axiosClient.post('/collections/create', { collection }, authOwner)

            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionName, [...SystemFields], env.capabilities))
        })

        test('collection create - collection with fields', async() => {       
            const collection = {
                id: ctx.collectionName,
                fields: [...SystemFields, ctx.column].map(schemaUtils.InputFieldToWixFormatField)
            }
            await axiosClient.post('/collections/create', { collection }, authOwner)
            
            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionName, [...SystemFields, ctx.column], env.capabilities))
        })

        test('collection update - add column', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)

            const collection = await schema.retrieveSchemaFor(ctx.collectionName, authOwner)

            collection.fields.push(schemaUtils.InputFieldToWixFormatField(ctx.column))
            await axiosClient.post('/collections/update', { collection }, authOwner)

            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.collectionResponsesWith(ctx.collectionName, [...SystemFields, ctx.column], env.capabilities))
        })

        testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('collection update - remove column', async() => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

            const collection = await schema.retrieveSchemaFor(ctx.collectionName, authOwner)

            // Check that the column exists
            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.collectionResponsesWith(ctx.collectionName, [...SystemFields, ctx.column], env.capabilities))

            const systemFieldsNames = SystemFields.map(f => f.name)
            collection.fields = collection.fields.filter((f: any) => systemFieldsNames.includes(f.key))

            await axiosClient.post('/collections/update', { collection }, authOwner)       
            
            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.collectionResponsesWith(ctx.collectionName, [...SystemFields], env.capabilities))
        })

        testIfSupportedOperationsIncludes(supportedOperations, [ ChangeColumnType ])('collection update - change column type', async() => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            const collection = await schema.retrieveSchemaFor(ctx.collectionName, authOwner)

            const columnIndex = collection.fields.findIndex((f: any) => f.key === ctx.column.name)
            collection.fields[columnIndex].type = schemaUtils.fieldTypeToWixDataEnum('number') 

            await axiosClient.post('/collections/update', { collection }, authOwner) 

            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionName, [...SystemFields, { name: ctx.column.name, type: 'number' }], env.capabilities))
        })

        test('collection delete', async() => {
            await schema.givenCollection(ctx.collectionName, [], authOwner)
            await axiosClient.post('/collections/delete', { collectionId: ctx.collectionName }, authOwner)
            await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).rejects.toThrow('404')
        })

        describe('error handling', () => {
            const CouldFailOnColumnTypeChangeDbs = ['mysql', 'postgres', 'mssql']
            if (CouldFailOnColumnTypeChangeDbs.includes(currentDbImplementationName())) {
                testIfSupportedOperationsIncludes(supportedOperations, [ ChangeColumnType ])('should throw "CollectionChangeNotSupported" error on failed collection alteration', async() => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)
                    const collection = await schema.retrieveSchemaFor(ctx.collectionName, authOwner)
        
                    const columnIndex = collection.fields.findIndex((f: any) => f.key === ctx.column.name)
                    collection.fields[columnIndex].type = schemaUtils.fieldTypeToWixDataEnum('number') 

                    await expect(axiosClient.post('/collections/update', { collection }, authOwner)).rejects.toMatchObject(collectionChangeNotSupportedErrorResponseWith([ ctx.column.name ]))
                })
            } 
        })
    })

    interface Ctx {
        collectionName: string
        anotherCollectionName: string
        column: InputField
        numberColumns: InputField[],
        item: { [x: string]: any }
        items: { [x: string]: any}[]
        modifiedItem: { [x: string]: any }
        modifiedItems: { [x: string]: any }
        anotherItem: { [x: string]: any }
        numberItem: { [x: string]: any }
        anotherNumberItem: { [x: string]: any }
    }

    const ctx: Ctx = {
        collectionName: Uninitialized,
        anotherCollectionName: Uninitialized,
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
        ctx.anotherCollectionName = gen.randomCollectionName()
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
