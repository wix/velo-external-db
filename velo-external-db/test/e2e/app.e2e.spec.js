const {expect} = require('chai')
//const chaiHttp = require('chai-http');
const mysql = require('../resources/mysql_resources');
const { Uninitialized } = require('../commons/test-commons');
const schema = require('../drivers/schema_api_rest_test_support');
const data = require('../drivers/data_api_rest_test_support');
const gen = require('../drivers/gen');
const chance = new require('chance')();

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});


describe('Velo External DB', () => {
    it('answer default page with a welcoming response', async () => {
        expect((await axios.get(`/`)).data).to.contain('<!doctype html>');
    })

    it('answer provision with stub response', async () => {
        expect((await axios.post(`/provision`)).data).to.be.eql({});
    })

    describe('Schema API', () => {

        it('list', async () => {
            expect((await axios.post(`/schemas/list`, {})).data).to.be.eql({ schemas: []});
        })

        it('create', async () => {
            await schema.givenCollection(ctx.collectionName, [])

            const res = await axios.post(`/schemas/list`, {})
            expect(res.data).to.be.deep.eql({ schemas: [{ id: ctx.collectionName,
                                               fields: [{name: '_id', type: 'varchar(256)', isPrimary: true},
                                                        {name: '_createdDate', type: 'timestamp', isPrimary: false},
                                                        {name: '_updatedDate', type: 'timestamp', isPrimary: false},
                                                        {name: '_owner', type: 'varchar(256)', isPrimary: false},
                                                        // {name: 'title', type: 'varchar(20)', isPrimary: false},
                                                       ]
                                            }] })

        })

        it('find', async () => {
            await schema.givenCollection(ctx.collectionName, [])

            const res = await axios.post(`/schemas/find`, { schemaIds: [ctx.collectionName]})
            expect(res.data).to.be.deep.eql({ schemas: [{ id: ctx.collectionName,
                                                          fields: [{name: '_id', type: 'varchar(256)', isPrimary: true},
                                                                   {name: '_createdDate', type: 'timestamp', isPrimary: false},
                                                                   {name: '_updatedDate', type: 'timestamp', isPrimary: false},
                                                                   {name: '_owner', type: 'varchar(256)', isPrimary: false},
                                                                // {name: 'title', type: 'varchar(20)', isPrimary: false},
                                                          ]
                                                        }]})

        })

        it('add column', async () => {
            await schema.givenCollection(ctx.collectionName, [])

            await axios.post(`/schemas/column/add`, {collectionName: ctx.collectionName, column: ctx.column})

            const field = await schema.expectColumnInCollection(ctx.column.name, ctx.collectionName)
            expect(field).to.be.deep.eql(ctx.column)
        })

        it('remove column', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column])

            await axios.post(`/schemas/column/remove`, {collectionName: ctx.collectionName, columnName: ctx.column.name})

            const field = await schema.expectColumnInCollection(ctx.column.name, ctx.collectionName)
            expect(field).to.be.undefined
        })

    })

    describe('Data API', () => {

        it('find api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column])
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName)

            expect((await axios.post(`/data/find`, {collectionName: ctx.collectionName, filter: '', sort: [{ fieldName: ctx.column.name }], skip: 0, limit: 25 })).data).to.be.eql({ items: [ ctx.item, ctx.anotherItem ].sort((a, b) => (a[ctx.column.name] > b[ctx.column.name]) ? 1 : -1),
                                                                                                                                                                                              totalCount: 0});
        })

        it('delete one api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column])
            await data.givenItems([ctx.item], ctx.collectionName)

            await axios.post(`/data/remove`, {collectionName: ctx.collectionName, itemId: ctx.item._id })

            expect(await data.expectAllDataIn(ctx.collectionName)).to.be.eql({ items: [ ], totalCount: 0});
        })

        it('get by id api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column])
            await data.givenItems([ctx.item], ctx.collectionName)

            expect((await axios.post(`/data/get`, {collectionName: ctx.collectionName, itemId: ctx.item._id})).data).to.be.eql({ item: ctx.item });
        })

        it('update api e2e', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column])
            await data.givenItems([ctx.item], ctx.collectionName)

            await axios.post(`/data/update`, {collectionName: ctx.collectionName, item: ctx.modifiedItem })

            expect(await data.expectAllDataIn(ctx.collectionName)).to.be.eql({ items: [ctx.modifiedItem], totalCount: 0});
        })

        it('count api', async () => {
            await schema.givenCollection(ctx.collectionName, [ctx.column])
            await data.givenItems([ctx.item, ctx.anotherItem], ctx.collectionName)

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

    const env = {
        server: Uninitialized,
    }

    beforeEach(async () => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.item = gen.randomEntity([ctx.column.name])
        ctx.modifiedItem = Object.assign({}, ctx.item, {[ctx.column.name]: chance.word()} )
        ctx.anotherItem = gen.randomEntity([ctx.column.name])
    });

    before(async function() {
        this.timeout(20000)
        await mysql.initMySqlEnv()

        env.server = require('../..')
    });

    after(async () => {
        await env.server.close()
        await mysql.shutdownMySqlEnv();
    });
})
