const {expect} = require('chai')
const DataProvider = require('./cloud_sql_data_provider')
const {SchemaProvider, SystemFields} = require('./cloud_sql_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const { randomEntities } = require('../../../../test/drivers/gen');
const chance = new require('chance')();
const mysqlSetup = require('@databases/mysql-test/jest/globalSetup')
const mysqlTeardown = require('@databases/mysql-test/jest/globalTeardown')
const mysql      = require('mysql2');



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
                                         fields: [{name: '_id', type: 'varchar(20)', isPrimary: true},
                                                  {name: '_createdDate', type: 'datetime', isPrimary: false},
                                                  {name: '_updatedDate', type: 'datetime', isPrimary: false},
                                                  {name: '_owner', type: 'varchar(20)', isPrimary: false},
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

    // describe('Query API', () => {
    //
    //     it('search with empty filter and order by', async () => {
    //
    //         // const connection = mysql.createConnection({
    //         //     host     : 'localhost',
    //         //     user     : 'test-user',
    //         //     password : 'password',
    //         //     database : 'test-db'
    //         // });
    //         //
    //         // connection.connect();
    //
    //         // const results = await env.connectionPool.query('SELECT 1 + 1 AS solution');
    //         // console.log('The solution is: ', results[0].solution);
    //
    //         //results[0].solution
    //
    //         // connection.end();
    //
    //         //mysql://test-user:password@localhost:3306/test-db
    //         // console.log(process.env.DATABASE_URL)
    //         // givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)
    //         //
    //         expect( await env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit) ).to.be.deep.eql([{ _id: 'stub' }]);
    //     });
    // })

    const ctx = {
        collectionName: Uninitialized,
        filter: Uninitialized,
        sort: Uninitialized,
        skip: Uninitialized,
        limit: Uninitialized,
        columnName: Uninitialized,
        entities: Uninitialized,
    };

    const env = {
        dataProvider: Uninitialized,
        schemaProvider: Uninitialized,
        connectionPool: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = chance.word();
        ctx.filter = chance.word();
        ctx.sort = chance.word();
        ctx.skip = chance.word();
        ctx.limit = chance.word();
        ctx.columnName = chance.word();

        ctx.entities = randomEntities();

    });

    before(async function() {
        this.timeout(20000)
        await mysqlSetup()/*.then(() => {*/
        env.connectionPool = mysql.createPool({
            host     : 'localhost',
            user     : 'test-user',
            password : 'password',
            database : 'test-db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }).promise();

        env.dataProvider = new DataProvider(env.connectionPool)
        env.schemaProvider = new SchemaProvider(env.connectionPool)
    });

    after(async () => {
        await mysqlTeardown();
    });




})
