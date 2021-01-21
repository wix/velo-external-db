const {expect} = require('chai')
const DataService = require('./data')
const { Uninitialized } = require('../../test/commons/test-commons');
const { randomEntities } = require('../../test/drivers/gen');
const { dataProvider, givenListResult } = require('../../test/drivers/data-provider-test-support');
const chance = new require('chance')();


describe('Data Service', () => {

    it('delegate request to data provider and translate data to velo format', async () => {
        givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

        expect( await env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit) ).to.be.deep.eql({ items: ctx.entities, totalCount: 0 });
    })

    const ctx = {
        collectionName: Uninitialized,
        filter: Uninitialized,
        sort: Uninitialized,
        skip: Uninitialized,
        limit: Uninitialized,
        entities: Uninitialized,
    };

    const env = {
        dataService: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = chance.word();
        ctx.filter = chance.word();
        ctx.sort = chance.word();
        ctx.skip = chance.word();
        ctx.limit = chance.word();

        ctx.entities = randomEntities();

        env.dataService = new DataService(dataProvider)
    });


})
