const {expect} = require('chai')
//const chaiHttp = require('chai-http');
const { initMySqlEnv, shutdownMySqlEnv } = require('../../test/resources/mysql_resources');
const { Uninitialized } = require('../../test/commons/test-commons');
const chance = new require('chance')();
/*
const DataProvider = require('./cloud_sql_data_provider')
const {SchemaProvider, SystemFields} = require('./cloud_sql_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const { randomEntities, randomEntity } = require('../../../../test/drivers/gen');
const chance = new require('chance')();
const { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor, givenFilterByIdWith, stubEmptyFilterFor, filterParser } = require('../../../../test/drivers/sql_filter_transformer_test_support')

 */

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


describe('Velo External DB', () => {
    let server;


    it('answer default page with a welcoming response', async () => {
        expect((await axios.get(`/`)).data).to.contain('<!doctype html>');
    })

    it('find api e2e', async () => {
        expect((await axios.post(`/data/find`, {collectionName: 'collectionName', filter: '', sort: '', skip: 0, limit: 25 })).data).to.be.eql({items: [ { _id: 'stub'} ], totalCount: 0});
    })

    describe('Schema API', () => {

        it('list', async () => {
            expect((await axios.post(`/schemas/list`, {})).data).to.be.eql([]);
        })

        it('create', async () => {
            await axios.post(`/schemas/create`, {collectionName: ctx.collectionName})

            const res = await axios.post(`/schemas/list`, {})
            expect(res.data).to.be.deep.eql([{ id: ctx.collectionName,
                                               fields: [{name: '_id', type: 'varchar(256)', isPrimary: true},
                                                        {name: '_createdDate', type: 'timestamp', isPrimary: false},
                                                        {name: '_updatedDate', type: 'timestamp', isPrimary: false},
                                                        {name: '_owner', type: 'varchar(256)', isPrimary: false},
                                                        // {name: 'title', type: 'varchar(20)', isPrimary: false},
                                                       ]
                                            }])

        })

        it('add column', async () => {
            await axios.post(`/schemas/create`, {collectionName: ctx.collectionName})

            await axios.post(`/schemas/column/add`, {collectionName: ctx.collectionName, column: ctx.column})

            const dbs = (await axios.post(`/schemas/list`, {})).data
            const field = dbs.find(e => e.id === ctx.collectionName)
                             .fields.find(e => e.name === ctx.column.name)
            expect(field).to.be.deep.eql(ctx.column)
        })

        it('remove column', async () => {
            await axios.post(`/schemas/create`, {collectionName: ctx.collectionName})
            await axios.post(`/schemas/column/add`, {collectionName: ctx.collectionName, column: ctx.column})

            await axios.post(`/schemas/column/remove`, {collectionName: ctx.collectionName, columnName: ctx.column.name})

            const dbs = (await axios.post(`/schemas/list`, {})).data

            const field = dbs.find(e => e.id === ctx.collectionName)
                             .fields.find(e => e.name === ctx.column.name)

            expect(field).to.be.undefined
        })

    })

    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized
    }

    beforeEach(async function() {
        ctx.collectionName = chance.word()
        ctx.column = {name: chance.word(), type: 'varchar(256)', isPrimary: false}

    });

    before(async function() {
        this.timeout(20000)
        await initMySqlEnv()
        server = require('../app')
    });

    after(async () => {
        await server.close()
        await shutdownMySqlEnv();
    });
})
