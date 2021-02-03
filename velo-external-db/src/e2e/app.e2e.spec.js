const {expect} = require('chai')
//const chaiHttp = require('chai-http');
const { initMySqlEnv, shutdownMySqlEnv } = require('../../test/resources/mysql_resources');
const { veloDate } = require('../../test/drivers/gen');
const { Uninitialized } = require('../../test/commons/test-commons');
const chance = new require('chance')();

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


describe('Velo External DB', () => {
    let server;

    const givenCollection = async (name, columns) => {
        await axios.post(`/schemas/create`, {collectionName: name})
        await Promise.all( columns.map(async column => await axios.post(`/schemas/column/add`, {collectionName: name, column: column})) )
    }

    const givenItems = async (items, collectionName) => await Promise.all( items.map(async item => await axios.post(`/data/insert`, {collectionName: collectionName, item: item })) )


    it('answer default page with a welcoming response', async () => {
        expect((await axios.get(`/`)).data).to.contain('<!doctype html>');
    })

    describe('Schema API', () => {

        it('list', async () => {
            expect((await axios.post(`/schemas/list`, {})).data).to.be.eql([]);
        })

        it('create', async () => {
            await givenCollection(ctx.collectionName, [])

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
            await givenCollection(ctx.collectionName, [])

            await axios.post(`/schemas/column/add`, {collectionName: ctx.collectionName, column: ctx.column})

            const dbs = (await axios.post(`/schemas/list`, {})).data
            const field = dbs.find(e => e.id === ctx.collectionName)
                             .fields.find(e => e.name === ctx.column.name)
            expect(field).to.be.deep.eql(ctx.column)
        })

        it('remove column', async () => {
            await givenCollection(ctx.collectionName, [ctx.column])

            await axios.post(`/schemas/column/remove`, {collectionName: ctx.collectionName, columnName: ctx.column.name})

            const dbs = (await axios.post(`/schemas/list`, {})).data
            const field = dbs.find(e => e.id === ctx.collectionName)
                             .fields.find(e => e.name === ctx.column.name)

            expect(field).to.be.undefined
        })

    })

    describe('Data API', () => {

        it('find api', async () => {
            await givenCollection(ctx.collectionName, [ctx.column])
            await givenItems([ctx.item, ctx.anotherItem], ctx.collectionName)

            expect((await axios.post(`/data/find`, {collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 })).data).to.be.eql({ items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                                                                                                                                                                                              totalCount: 0});
        })

        it('delete one api', async () => {
            await givenCollection(ctx.collectionName, [ctx.column])
            await givenItems([ctx.item], ctx.collectionName)

            await axios.post(`/data/remove`, {collectionName: ctx.collectionName, itemId: ctx.item._id })

            expect((await axios.post(`/data/find`, {collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 })).data).to.be.eql({ items: [ ],
                                                                                                                                                                                              totalCount: 0});
        })

        it('get by id api', async () => {
            await givenCollection(ctx.collectionName, [ctx.column])
            await givenItems([ctx.item], ctx.collectionName)

            expect((await axios.post(`/data/get`, {collectionName: ctx.collectionName, itemId: ctx.item._id})).data).to.be.eql({ item: ctx.item });
        })

        it('update api e2e', async () => {
            await givenCollection(ctx.collectionName, [ctx.column])
            await givenItems([ctx.item], ctx.collectionName)

            await axios.post(`/data/update`, {collectionName: ctx.collectionName, item: ctx.modifiedItem })

            expect((await axios.post(`/data/find`, {collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 })).data).to.be.eql({ items: [ctx.item/*ctx.modifiedItem*/],
                                                                                                                                                                                              totalCount: 0});
        })

        it('count api', async () => {
            await givenCollection(ctx.collectionName, [ctx.column])
            await givenItems([ctx.item, ctx.anotherItem], ctx.collectionName)

            expect((await axios.post(`/data/count`, {collectionName: ctx.collectionName, filter: '' })).data).to.be.eql({ totalCount: 2});
        })
    })


    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        item: Uninitialized,
        modifiedItem: Uninitialized,
        anotherItem: Uninitialized,
    }

    beforeEach(async () => {
        ctx.collectionName = chance.word()
        ctx.column = {name: chance.word(), type: 'varchar(256)', isPrimary: false}
        ctx.item = { _id: chance.guid(), _owner: chance.guid(), _createdDate: veloDate(), _updatedDate: veloDate() , [ctx.column.name]: chance.word()}
        ctx.modifiedItem = { _id: ctx.item._id, _owner: ctx.item._owner, _createdDate: ctx.item._createdDate, _updatedDate: ctx.item._updatedDate , [ctx.column.name]: chance.word()}
        ctx.anotherItem = { _id: chance.guid(), _owner: chance.guid(), _createdDate: veloDate(), _updatedDate: veloDate() , [ctx.column.name]: chance.word()}
    });

    before(async function() {
        this.timeout(20000)
        await initMySqlEnv()

        process.env.TYPE = 'gcp/sql'
        process.env.HOST = 'localhost'
        process.env.USER = 'test-user'
        process.env.PASSWORD = 'password'
        process.env.DB = 'test-db'

        server = require('../app')
    });

    after(async () => {
        await server.close()
        await shutdownMySqlEnv();
    });
})
