const {expect} = require('chai')
const {SchemaProvider, SystemFields} = require('./spanner_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const gen = require('../../../../test/drivers/gen');
const chance = new require('chance')();
// const testkit = require('docker-compose')
// const testkit = require('@seasquared/docker-compose-testkit')
// const {Spanner} = require('@google-cloud/spanner');

describe.only('Spanner Service', function () {
    this.timeout(50000);

    describe('Schema API', () => {
        it.skip('list of empty db will result with an empty array', async function() {
            // this.timeout(5000);

            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([])
        })

        it.skip('create collection with default columns', async function() {
            // this.timeout(10000);

            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([{ id: ctx.collectionName,
                fields: [{name: 'id_', type: 'STRING(256)', isPrimary: true},
                         {name: 'createdDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'updatedDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'owner_', type: 'STRING(256)', isPrimary: false},
                    // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            }])
        })

        it('retrieve collection data by collection name', async function () {
            // this.timeout(10000);

            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).to.be.deep.eql({ id: ctx.collectionName,
                fields: [{name: 'id_', type: 'STRING(256)', isPrimary: true},
                         {name: 'createdDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'updatedDate_', type: 'TIMESTAMP', isPrimary: false},
                         {name: 'owner_', type: 'STRING(256)', isPrimary: false},
                    // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            })
        })

        it.skip('create collection twice will do nothing', async function() {
            // this.timeout(10000);

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
        this.timeout(20000)

        const projectId = 'corvid-managed-361ecdb3'
        const instanceId = 'corvid-managed-361ecdb3-431b593c'
        const databaseId = 'velo_db'

        env.schemaProvider = new SchemaProvider(projectId, instanceId, databaseId)
    //
    //     // const zz = await testkit.runDockerCompose('gcr.io/cloud-spanner-emulator/emulator')
    //     // console.log(zz)
    //
    //     // env.connectionPool = await mysql.initMySqlEnv()
    //     // env.schemaProvider = new SchemaProvider(env.connectionPool)
    });

    // after(async () => {
    //     // await mysql.shutdownMySqlEnv();
    // });
})
