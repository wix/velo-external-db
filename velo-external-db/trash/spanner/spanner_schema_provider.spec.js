const {SchemaProvider, SystemFields} = require('./spanner_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const gen = require('../../../../test/drivers/gen');
const resource = require('../../../../test/resources/spanner_resources');
const Chance = require('chance')
const chance = Chance();


describe.skip('Spanner Service', function () {

    describe('Schema API', () => {
        test('list of empty db will result with an empty array', async function() {
            const db = await env.schemaProvider.list()
            expect(db).toEqual([])
        })

        test('create collection with default columns', async function() {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.list()
            expect(db).toEqual([{ id: ctx.collectionName,
                fields: [{name: 'id_', type: 'STRING(256)', isPrimary: true},
                         {name: 'createdDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'updatedDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'owner_', type: 'STRING(256)', isPrimary: false},
                    // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            }])
        })

        test('retrieve collection data by collection name', async function () {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).toEqual({ id: ctx.collectionName,
                fields: [{name: 'id_', type: 'STRING(256)', isPrimary: true},
                         {name: 'createdDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'updatedDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'owner_', type: 'STRING(256)', isPrimary: false},
                    // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            })
        })

        it.skip('create collection twice will do nothing', async function() {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.create(ctx.collectionName, [])
        })

        test('add column on a non existing collection will fail', async () => {
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})
        })

        test('add column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields.find(e => e.name === ctx.columnName)).toEqual({name: ctx.columnName, type: 'TIMESTAMP', isPrimary: false})
        })

        test('add duplicate column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})
        })

        test('add system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                        .map(async f => {
                            await env.schemaProvider.addColumn(ctx.collectionName, {name: f, type: 'TIMESTAMP'})
                        })
        })

        test('drop column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields.find(e => e.name === ctx.columnName)).to.be.an('undefined')
        })

        test('drop column on a a non existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)
        })

        test('drop system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                .map(async f => {
                    await env.schemaProvider.removeColumn(ctx.collectionName, f)
                })
        })
    })

    const ctx = {
        collectionName: Uninitialized,
        columnName: Uninitialized,
    };

    const env = {
        schemaProvider: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = gen.randomCollectionName();
        ctx.columnName = chance.word();
    });

    beforeAll(async function() {
        const projectId = 'test-project'
        const instanceId = 'test-instance'
        const databaseId = 'test-database'

        await resource.initSpannerEnv()

        env.schemaProvider = new SchemaProvider(projectId, instanceId, databaseId)
    });

    afterAll(async () => {
        await resource.shutSpannerEnv()
    });
})
