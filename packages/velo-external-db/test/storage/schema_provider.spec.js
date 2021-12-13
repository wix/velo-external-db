const { CollectionDoesNotExists, FieldAlreadyExists, CannotModifySystemField, FieldDoesNotExist } = require('velo-external-db-commons').errors
const { Uninitialized, gen } = require('test-commons')
const each = require('jest-each').default
const Chance = require('chance')
const { env, testSuits, dbTeardown } = require('../resources/provider_resources')
const chance = new Chance()
const { SystemFields, asWixSchema, schemasWithoutSubtype } = require('velo-external-db-commons')


describe('Schema API', () => {
    each(testSuits()).describe('%s', (name, setup) => {

        beforeAll(async() => {
            await setup()
        }, 20000)

        afterAll(async() => {
            await dbTeardown()
        }, 20000)

        test('list of empty db will result with an empty array', async() => {
            const db = await env.schemaProvider.list()

            expect(db).toEqual([])
        })

        test('list db will result with a list of wix databases', async() => {
            await env.schemaProvider.create(ctx.collectionName)
            await env.schemaProvider.create(ctx.anotherCollectionName)

            const dbs = await env.schemaProvider.list()

            expect(schemasWithoutSubtype(dbs)).toEqual(expect.arrayContaining([
                                    asWixSchema([{ field: '_id', type: 'text' },
                                                     { field: '_createdDate', type: 'datetime' },
                                                     { field: '_updatedDate', type: 'datetime' },
                                                     { field: '_owner', type: 'text' }], ctx.collectionName),
                                    asWixSchema([{ field: '_id', type: 'text' },
                                                     { field: '_createdDate', type: 'datetime' },
                                                     { field: '_updatedDate', type: 'datetime' },
                                                     { field: '_owner', type: 'text' }], ctx.anotherCollectionName),
            ]))
        })

        test('create collection with default columns', async() => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)

            expect(schemasWithoutSubtype([db])[0]).toEqual(asWixSchema([{ field: '_id', type: 'text' },
                                                { field: '_createdDate', type: 'datetime' },
                                                { field: '_updatedDate', type: 'datetime' },
                                                { field: '_owner', type: 'text' }], ctx.collectionName))
        })

        test('drop collection', async() => {
            await env.schemaProvider.create(ctx.collectionName)

            await env.schemaProvider.drop(ctx.collectionName)

            await expect(env.schemaProvider.describeCollection(ctx.collectionName)).rejects.toThrow(CollectionDoesNotExists)
        })

        test('collection name and variables are case sensitive', async() => {
            await env.schemaProvider.create(ctx.collectionName.toUpperCase())

            const db = await env.schemaProvider.describeCollection(ctx.collectionName.toUpperCase())
            expect(schemasWithoutSubtype([db])[0]).toEqual(asWixSchema([{ field: '_id', type: 'text' },
                                                { field: '_createdDate', type: 'datetime' },
                                                { field: '_updatedDate', type: 'datetime' },
                                                { field: '_owner', type: 'text' }], ctx.collectionName.toUpperCase()))
        })

        test('retrieve collection data by collection name', async() => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(schemasWithoutSubtype([db])[0]).toEqual(asWixSchema([{ field: '_id', type: 'text' },
                                                { field: '_createdDate', type: 'datetime' },
                                                { field: '_updatedDate', type: 'datetime' },
                                                { field: '_owner', type: 'text' }], ctx.collectionName))
        })

        // eslint-disable-next-line jest/expect-expect
        test('create collection twice will do nothing', async() => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.create(ctx.collectionName, [])
        })

        test('add column on a non existing collection will fail', async() => {
            await expect(env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })).rejects.toThrow(CollectionDoesNotExists)
        })

        test('add column on a an existing collection', async() => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })
            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            
            expect(schemasWithoutSubtype([db])[0].fields).toHaveProperty(ctx.columnName,
                                                                            { displayName: ctx.columnName, type: 'datetime',
                                                                                queryOperators: [
                                                                                    'eq',
                                                                                    'lt',
                                                                                    'gt',
                                                                                    'hasSome',
                                                                                    'and',
                                                                                    'lte',
                                                                                    'gte',
                                                                                    'or',
                                                                                    'not',
                                                                                    'ne',
                                                                                    'startsWith',
                                                                                    'endsWith',
                                                                                ] })
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

        test('drop column on a an existing collection', async() => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, { name: ctx.columnName, type: 'datetime', subtype: 'timestamp' })

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.describeCollection(ctx.collectionName)).fields).not.toHaveProperty(ctx.columnName)
        })

        test('drop column on a a non existing collection', async() => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await expect(env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)).rejects.toThrow(FieldDoesNotExist)
        })

        test('drop system column will fail', async() => {
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
})

