import Chance = require('chance')
import { errors, SystemFields } from '@wix-velo/velo-external-db-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
import { Uninitialized, gen, testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import { env, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/provider_resources'
import { toContainDefaultFields, collectionToContainFields, toBeDefaultCollectionWith, hasSameSchemaFieldsLike } from '../drivers/schema_provider_matchers'

const chance = new Chance()
const { CollectionDoesNotExists, FieldAlreadyExists, CannotModifySystemField, FieldDoesNotExist } = errors
const { RemoveColumn } = SchemaOperations


describe(`Schema API: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    test('list of empty db will result with an empty array', async() => {
        await expect( env.schemaProvider.list() ).resolves.toEqual([])
    })

    test('list headers will result with an array of collection names', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        await expect( env.schemaProvider.listHeaders() ).resolves.toEqual([ctx.collectionName])
    })

    test('supported operations is defined', async() => {
        expect( env.schemaProvider.supportedOperations() ).not.toEqual([])
    })

    test('list db will result with a list of wix databases', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)
        await env.schemaProvider.create(ctx.anotherCollectionName, SystemFields)

        await expect( env.schemaProvider.list() ).resolves.toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: ctx.collectionName,
                fields: toContainDefaultFields(env.capabilities.ColumnsCapabilities)
            }),
            expect.objectContaining({
                id: ctx.anotherCollectionName,
                fields: toContainDefaultFields(env.capabilities.ColumnsCapabilities)
            })
        ]))
    })

    test('create collection with default columns', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        await expect( env.schemaProvider.describeCollection(ctx.collectionName) ).resolves.toEqual(toBeDefaultCollectionWith(ctx.collectionName, env.capabilities))
    })

    test('drop collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        await env.schemaProvider.drop(ctx.collectionName)

        await expect(env.schemaProvider.describeCollection(ctx.collectionName)).rejects.toThrow(CollectionDoesNotExists)
    })

    test('collection name and variables are case sensitive', async() => {
        await env.schemaProvider.create(ctx.collectionName.toUpperCase(), SystemFields)

        await expect( env.schemaProvider.describeCollection(ctx.collectionName.toUpperCase()) ).resolves.toEqual(toBeDefaultCollectionWith(ctx.collectionName.toUpperCase(), env.capabilities))
    })

    test('retrieve collection data by collection name', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        await expect( env.schemaProvider.describeCollection(ctx.collectionName) ).resolves.toEqual(toBeDefaultCollectionWith(ctx.collectionName, env.capabilities))
    })

    test('create collection twice will do nothing', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        await expect( env.schemaProvider.create(ctx.collectionName, SystemFields) ).resolves.toBeUndefined()
    })

    test('add column on a non existing collection will fail', async() => {
        await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(CollectionDoesNotExists)
    })

    test('add column on a an existing collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)
        await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })
        await expect( env.schemaProvider.describeCollection(ctx.collectionName) ).resolves.toEqual(collectionToContainFields(ctx.collectionName, [{ field: ctx.columnName, type: 'datetime' }], env.capabilities))
    })

    test('add duplicate column will fail', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })

        await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(FieldAlreadyExists)
    })

    test('add system column will fail', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)

        SystemFields.map(f => f.name)
            .forEach(async f => {
                await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: f, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(CannotModifySystemField)
            })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('drop column on a an existing collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)
        await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })
        await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)
        await expect(env.schemaProvider.describeCollection(ctx.collectionName)).resolves.not.toEqual(hasSameSchemaFieldsLike([{ field: ctx.columnName, type: 'datetime' }]))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('drop column on a a non existing collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)
        await expect(env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)).rejects.toThrow(FieldDoesNotExist)
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('drop system column will fail', async() => {
        await env.schemaProvider.create(ctx.collectionName, SystemFields)
        SystemFields.map(f => f.name)
            .forEach(async f => {
                await expect(env.schemaProvider.removeColumn(ctx.collectionName, f)).rejects.toThrow(CannotModifySystemField)
        })
    })

    const ctx = {
        collectionName: Uninitialized,
        anotherCollectionName: Uninitialized,
        columnName: Uninitialized,
    }

    beforeEach(() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.anotherCollectionName = gen.randomCollectionName()
        ctx.columnName = chance.word()
    })

})

