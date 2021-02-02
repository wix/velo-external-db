const {expect} = require('chai')
const DataProvider = require('./cloud_sql_data_provider')
const {SchemaProvider, SystemFields} = require('./cloud_sql_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const { randomDbEntities, randomDbEntity } = require('../../../../test/drivers/gen');
const { initMySqlEnv, shutdownMySqlEnv } = require('../../../../test/resources/mysql_resources');
const chance = new require('chance')();

describe('Cloud SQL Service', () => {

    describe('Schema API', () => {
        it('list of empty db will result with an empty array', async () => {
            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([])
        })

        it('create collection with default columns', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([{ id: ctx.collectionName,
                fields: [{name: '_id', type: 'varchar(256)', isPrimary: true},
                    {name: '_createdDate', type: 'timestamp', isPrimary: false},
                    {name: '_updatedDate', type: 'timestamp', isPrimary: false},
                    {name: '_owner', type: 'varchar(256)', isPrimary: false},
                    // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            }])
        })

        it('create collection twice will do nothing', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.create(ctx.collectionName, [])
        })

        it('add column on a non existing collection will fail', async () => {
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime'})
        })

        it('add column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime'})

            expect((await env.schemaProvider.list()).find(e => e.id === ctx.collectionName)
                .fields.find(e => e.name === ctx.columnName)).to.be.deep.eql({name: ctx.columnName, type: 'datetime', isPrimary: false})
        })

        it('add duplicate column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime'})
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime'})
        })

        it('add system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                .map(async f => {
                    await env.schemaProvider.addColumn(ctx.collectionName, {name: f, type: 'datetime'})
                })
        })

        it('drop column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime'})

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.list()).find(e => e.id === ctx.collectionName)
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
        filter: Uninitialized,
        sort: Uninitialized,
        skip: Uninitialized,
        limit: Uninitialized,
        columnName: Uninitialized,
        entity: Uninitialized,
        anotherEntity: Uninitialized,
        entities: Uninitialized,
    };

    const env = {
        schemaProvider: Uninitialized,
        connectionPool: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = chance.word();
        ctx.filter = chance.word();
        ctx.sort = chance.word();
        ctx.skip = 0;
        ctx.limit = 10;
        ctx.columnName = chance.word();

        ctx.entity = randomDbEntity([]);
        ctx.anotherEntity = randomDbEntity([]);
        ctx.entities = randomDbEntities();
    });

    before(async function() {
        this.timeout(20000)
        env.connectionPool = await initMySqlEnv()
        env.schemaProvider = new SchemaProvider(env.connectionPool)
    });

    after(async () => {
        await shutdownMySqlEnv();
    });
})
