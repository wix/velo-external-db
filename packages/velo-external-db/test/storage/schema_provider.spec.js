const { CollectionDoesNotExists, FieldAlreadyExists, CannotModifySystemField, FieldDoesNotExist } = require('@wix-velo/velo-external-db-commons').errors
const { Uninitialized, gen, testIfSupportedOperationsIncludes } = require('@wix-velo/test-commons')
const { RemoveColumn } = require('@wix-velo/velo-external-db-commons').SchemaOperations
const Chance = require('chance')
const { env, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } = require('../resources/provider_resources')
const { collectionWithDefaultFields, hasSameSchemaFieldsLike } = require('../drivers/schema_provider_matchers')
const chance = new Chance()
const { SystemFields } = require('@wix-velo/velo-external-db-commons')



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
        await env.schemaProvider.create(ctx.collectionName)

        await expect( env.schemaProvider.listHeaders() ).resolves.toEqual([ctx.collectionName])
    })

    // TODO: remove this test if supportedOperations method will be removed from schema provider
    test('supported operations is defined', async() => {
        expect( env.schemaProvider.supportedOperations() ).not.toEqual([])
    })

    test('list db will result with a list of wix databases', async() => {
        await env.schemaProvider.create(ctx.collectionName)
        await env.schemaProvider.create(ctx.anotherCollectionName)

        await expect( env.schemaProvider.list() ).resolves.toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: ctx.collectionName,
                fields: collectionWithDefaultFields()
            }),
            expect.objectContaining({
                id: ctx.anotherCollectionName,
                fields: collectionWithDefaultFields()
            })
        ]))
    })

    test('create collection with default columns', async() => {
        await env.schemaProvider.create(ctx.collectionName)

        await expect( env.schemaProvider.describeCollection(ctx.collectionName) ).resolves.toEqual(collectionWithDefaultFields())
    })

    test('drop collection', async() => {
        await env.schemaProvider.create(ctx.collectionName)

        await env.schemaProvider.drop(ctx.collectionName)

        await expect(env.schemaProvider.describeCollection(ctx.collectionName)).rejects.toThrow(CollectionDoesNotExists)
    })

    test('collection name and variables are case sensitive', async() => {
        await env.schemaProvider.create(ctx.collectionName.toUpperCase())

        await expect( env.schemaProvider.describeCollection(ctx.collectionName.toUpperCase()) ).resolves.toEqual(collectionWithDefaultFields())
    })

    test('retrieve collection data by collection name', async() => {
        await env.schemaProvider.create(ctx.collectionName)

        await expect( env.schemaProvider.describeCollection(ctx.collectionName) ).resolves.toEqual(collectionWithDefaultFields())
    })

    test('create collection twice will do nothing', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])

        await expect( env.schemaProvider.create(ctx.collectionName, []) ).resolves.toBeUndefined()
    })

    test('add column on a non existing collection will fail', async() => {
        await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(CollectionDoesNotExists)
    })

    test('add column on a an existing collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])
        await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })
        await expect( env.schemaProvider.describeCollection(ctx.collectionName) ).resolves.toEqual( hasSameSchemaFieldsLike([{ field: ctx.columnName  }]))
    })

    test('add duplicate column will fail', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])

        await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })

        await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(FieldAlreadyExists)
    })

    test('add system column will fail', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])

        SystemFields.map(f => f.name)
            .forEach(async f => {
                await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: f, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(CannotModifySystemField)
            })
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('drop column on a an existing collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])
        await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })
        await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)
        await expect(env.schemaProvider.describeCollection(ctx.collectionName)).resolves.not.toEqual(hasSameSchemaFieldsLike([{ field: ctx.columnName, type: 'datetime' }]))
    })


    testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('drop column on a a non existing collection', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])
        await expect(env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)).rejects.toThrow(FieldDoesNotExist)
    })

    testIfSupportedOperationsIncludes(supportedOperations, [ RemoveColumn ])('drop system column will fail', async() => {
        await env.schemaProvider.create(ctx.collectionName, [])
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

