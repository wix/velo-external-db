const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const {SchemaProvider, SystemFields} = require('./spanner_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const gen = require('../../../../test/drivers/gen');
const resource = require('../../../../test/resources/spanner_resources');
const chance = new require('chance')();

chai.use(deepEqualInAnyOrder);
const { expect } = chai;


describe('Spanner Service', function () {

    describe('Schema API', () => {
        it('list of empty db will result with an empty array', async function() {
            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([])
        })

        it('create collection with default columns', async function() {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.equalInAnyOrder([{ id: ctx.collectionName,
                fields: [{name: 'id_', type: 'STRING(256)', isPrimary: true},
                         {name: 'createdDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'updatedDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'owner_', type: 'STRING(256)', isPrimary: false},
                    // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            }])
        })

        it('retrieve collection data by collection name', async function () {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).to.be.deep.equalInAnyOrder({ id: ctx.collectionName,
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

        it('add column on a non existing collection will fail', async () => {
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})
        })

        it('add column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields.find(e => e.name === ctx.columnName)).to.be.deep.eql({name: ctx.columnName, type: 'TIMESTAMP', isPrimary: false})
        })

        it('add duplicate column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})
        })

        it('add system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                        .map(async f => {
                            await env.schemaProvider.addColumn(ctx.collectionName, {name: f, type: 'TIMESTAMP'})
                        })
        })

        it('drop column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'TIMESTAMP'})

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields.find(e => e.name === ctx.columnName)).to.be.an('undefined')
        })

        it('drop column on a a non existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)
        })

        it('drop system column will fail', async () => {
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

    before(async function() {
        const projectId = 'test-project'
        const instanceId = 'test-instance'
        const databaseId = 'test-database'

        await resource.initSpannerEnv()

        env.schemaProvider = new SchemaProvider(projectId, instanceId, databaseId)
    });

    after(async () => {
        await resource.shutSpannerEnv()
    });
})
