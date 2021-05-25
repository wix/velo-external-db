const SchemaService = require('./schema')
const { Uninitialized } = require('../../test/commons/test-commons');
const gen = require('../../test/drivers/gen');
const driver = require('../../test/drivers/schema-provider-test-support');

describe('Schema Service', () => {

    it('retrieve all collections from provider', async () => {
        driver.givenListResult(ctx.dbs)

        const actual = await env.schemaService.list()
        expect( actual ).toEqual({ schemas: ctx.dbs });
    })

    it('retrieve collections by ids from provider', async () => {
        driver.givenFindResults(ctx.dbs)

        const actual = await env.schemaService.find(ctx.dbs.map(db => db.id))
        expect( actual ).toEqual({ schemas: ctx.dbs });
    })

    it('create collection name', async () => {
        driver.expectCreateOf(ctx.collectionName)

        await env.schemaService.create(ctx.collectionName)
    })

    it('add column for collection name', async () => {
        driver.expectCreateColumnOf(ctx.column, ctx.collectionName)

        await env.schemaService.addColumn(ctx.collectionName, ctx.column)
    })

    it('remove column from collection name', async () => {
        driver.expectRemoveColumnOf(ctx.column, ctx.collectionName)

        await env.schemaService.removeColumn(ctx.collectionName, ctx.column.name)
    })

    const ctx = {
        dbs: Uninitialized,
        collectionName: Uninitialized,
        column: Uninitialized,
    };

    const env = {
        schemaService: Uninitialized,
    };

    beforeEach(() => {
        driver.reset()

        ctx.dbs = gen.randomDbs()
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()

        env.schemaService = new SchemaService(driver.schemaProvider)
    });
})