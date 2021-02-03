const { expect } = require('chai')
const DataService = require('./data')
const { Uninitialized } = require('../../test/commons/test-commons');
const gen = require('../../test/drivers/gen');
const driver = require('../../test/drivers/data-provider-test-support');
const chance = new require('chance')();

describe('Data Service', () => {

    it('delegate request to data provider and translate data to velo format', async () => {
        driver.givenListResult(ctx.entities, ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

        const actual = await env.dataService.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)
        expect( actual ).to.be.deep.eql({ items: ctx.entities, totalCount: 0 });
    })

    it('count data from collection', async () => {
        driver.givenCountResult(ctx.total, ctx.collectionName, ctx.filter)

        const actual = await env.dataService.count(ctx.collectionName, ctx.filter)
        expect( actual ).to.be.deep.eql({ totalCount: ctx.total });
    })

    it('get by id will issue a call to find and transform the result', async () => {
        driver.givenListResult([ctx.entity], ctx.collectionName,
                        { kind: 'filter',
                               operator: '$eq',
                               fieldName: '_id',
                               value: ctx.itemId
                              }, '', 0, 1)

        const actual = await env.dataService.getById(ctx.collectionName, ctx.itemId)
        expect( actual ).to.be.deep.eql({ item: ctx.entity });
    })

    it('insert will insert data into db', async () => {
        driver.expectInsertFor(ctx.entity, ctx.collectionName)

        const actual = await env.dataService.insert(ctx.collectionName, ctx.entity)
        return expect( actual  ).to.be.deep.eql({ item: ctx.entity });
    })

    it('update will update data into db', async () => {
        driver.expectUpdateFor(ctx.entity, ctx.collectionName)

        const actual = await env.dataService.update(ctx.collectionName, ctx.entity)
        expect( actual ).to.be.deep.eql({ item: ctx.entity });
    })

    const ctx = {
        collectionName: Uninitialized,
        filter: Uninitialized,
        sort: Uninitialized,
        skip: Uninitialized,
        limit: Uninitialized,
        entities: Uninitialized,
        entity: Uninitialized,
        itemId: Uninitialized,
        total: Uninitialized,
    };

    const env = {
        dataService: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.filter = chance.word();
        ctx.sort = chance.word();
        ctx.skip = chance.word();
        ctx.limit = chance.word();
        ctx.itemId = chance.guid();
        ctx.total = chance.natural({min: 2, max: 20});

        ctx.entities = gen.randomEntities();
        ctx.entity = gen.randomEntity();

        env.dataService = new DataService(driver.dataProvider)
    });


})
