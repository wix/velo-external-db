const CloudSqlDataProvider = require('./gcp/sql/cloud_sql_data_provider')
const cloudSql = require('./gcp/sql/cloud_sql_schema_provider')
const driver = require('../../test/drivers/sql_filter_transformer_test_support')
const { Uninitialized } = require('../../test/commons/test-commons');
const gen = require('../../test/drivers/gen');
const mysql = require('../../test/resources/mysql_resources');
const each = require('jest-each').default
const Chance = require('chance');
const chance = new Chance();


const env1 = {
    dataProvider: Uninitialized,
    schemaProvider: Uninitialized,
    connectionPool: Uninitialized,
};

// const env2 = {
//     schemaProvider: Uninitialized,
//     connectionPool: Uninitialized,
// };

beforeAll(async () => {
    // cloud Sql
    env1.connectionPool = await mysql.initMySqlEnv()
    env1.schemaProvider = new cloudSql.SchemaProvider(env1.connectionPool)
    env1.dataProvider = new CloudSqlDataProvider(env1.connectionPool, driver.filterParser)

    // // spanner
    // const projectId = 'test-project'
    // const instanceId = 'test-instance'
    // const databaseId = 'test-database'
    //
    // await resource.initSpannerEnv()
    //
    // env2.schemaProvider = new spanner.SchemaProvider(projectId, instanceId, databaseId)
}, 20000);


afterAll(async () => {
    await mysql.shutdownMySqlEnv();

    // await resource.shutSpannerEnv()
}, 20000);


describe('Data API', () => {

    each([
        ['Cloud Sql', env1],
        // ['Spanner', env2],
    ]).describe('%s', (name, env) => {

        const givenCollectionWith = async (entities, forCollection) => {
            await env.dataProvider.insert(forCollection, entities)
        }

        test('search with empty filter and order by and no data', async () => {
            driver.stubEmptyFilterFor(ctx.filter)
            driver.stubEmptyOrderByFor(ctx.sort)

            const res = await env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

            expect( res ).toEqual([]);
        });

        test('search with non empty filter will return data', async () => {
            await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName)
            driver.givenFilterByIdWith(ctx.entity._id, ctx.filter)
            driver.stubEmptyOrderByFor(ctx.sort)

            const res = await env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

            expect( res ).toEqual(expect.arrayContaining([ctx.entity]));
        });

        test('search with non empty order by will return sorted data', async () => {
            await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName)
            driver.stubEmptyFilterFor(ctx.filter)
            driver.givenOrderByFor('_owner', ctx.sort)

            const res = await env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, ctx.skip, ctx.limit)

            expect( res ).toEqual([ctx.anotherEntity, ctx.entity].sort((a, b) => (a._owner > b._owner) ? 1 : -1));
        });

        test('search with empty order and filter but with limit and skip', async () => {
            await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName)
            driver.stubEmptyFilterFor(ctx.filter)
            driver.givenOrderByFor('_owner', ctx.sort)

            const res = await env.dataProvider.find(ctx.collectionName, ctx.filter, ctx.sort, 1, 1)

            expect( res ).toEqual([ctx.anotherEntity, ctx.entity].sort((a, b) => (a._owner < b._owner) ? 1 : -1).slice(0, 1));
        });

        test('aggregate api without filter', async () => {
            await env.schemaProvider.create(ctx.numericCollectionName, ctx.numericColumns)
            await givenCollectionWith([ctx.numberEntity, ctx.anotherNumberEntity], ctx.numericCollectionName)

            driver.stubEmptyFilterFor(ctx.filter)
            driver.givenHavingFilterWith(ctx.aliasColumns, ctx.aggregation.postFilteringStep)
            driver.givenAggregateQueryWith(ctx.aggregation.processingStep, ctx.numericColumns, ctx.aliasColumns, ['_id'])

            const res = await env.dataProvider.aggregate(ctx.numericCollectionName, ctx.filter, ctx.aggregation)

            expect( res ).toEqual(expect.arrayContaining([{ _id: ctx.numberEntity._id, [ctx.aliasColumns[0]]: ctx.numberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.numberEntity[ctx.numericColumns[1].name]},
                                                          { _id: ctx.anotherNumberEntity._id, [ctx.aliasColumns[0]]: ctx.anotherNumberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.anotherNumberEntity[ctx.numericColumns[1].name] }
            ]));
        });

        test('aggregate api without having', async () => {
            await env.schemaProvider.create(ctx.numericCollectionName, ctx.numericColumns)
            await givenCollectionWith([ctx.numberEntity, ctx.anotherNumberEntity], ctx.numericCollectionName)

            driver.stubEmptyFilterFor(ctx.filter)
            driver.stubEmptyHavingFilterFor(ctx.aggregation.postFilteringStep)
            driver.givenAggregateQueryWith(ctx.aggregation.processingStep, ctx.numericColumns, ctx.aliasColumns, ['_id'])

            const res = await env.dataProvider.aggregate(ctx.numericCollectionName, ctx.filter, ctx.aggregation)

            expect( res ).toEqual(expect.arrayContaining([{ _id: ctx.numberEntity._id, [ctx.aliasColumns[0]]: ctx.numberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.numberEntity[ctx.numericColumns[1].name]},
                                                          { _id: ctx.anotherNumberEntity._id, [ctx.aliasColumns[0]]: ctx.anotherNumberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.anotherNumberEntity[ctx.numericColumns[1].name] }
            ]));
        });

        test('aggregate api with filter', async () => {
            await env.schemaProvider.create(ctx.numericCollectionName, ctx.numericColumns)
            await givenCollectionWith([ctx.numberEntity, ctx.anotherNumberEntity], ctx.numericCollectionName)

            driver.givenFilterByIdWith(ctx.numberEntity._id, ctx.filter)
            driver.givenHavingFilterWith(ctx.aliasColumns, ctx.aggregation.postFilteringStep)
            driver.givenAggregateQueryWith(ctx.aggregation.processingStep, ctx.numericColumns, ctx.aliasColumns, ['_id'])

            const res = await env.dataProvider.aggregate(ctx.numericCollectionName, ctx.filter, ctx.aggregation)

            expect( res ).toEqual([{ _id: ctx.numberEntity._id, [ctx.aliasColumns[0]]: ctx.numberEntity[ctx.numericColumns[0].name], [ctx.aliasColumns[1]]: ctx.numberEntity[ctx.numericColumns[1].name]}])
        });


        test('count will run query', async () => {
            await givenCollectionWith(ctx.entities, ctx.collectionName)
            driver.stubEmptyFilterFor(ctx.filter)

            const res = await env.dataProvider.count(ctx.collectionName, ctx.filter)

            expect( res ).toEqual(ctx.entities.length);
        });

        test('count will run query with filter', async () => {
            await givenCollectionWith([ctx.entity, ctx.anotherEntity], ctx.collectionName)
            driver.givenFilterByIdWith(ctx.entity._id, ctx.filter)

            const res = await env.dataProvider.count(ctx.collectionName, ctx.filter)

            expect( res ).toEqual(1);
        });

        test('insert data into collection name and query all of it', async () => {
            driver.stubEmptyFilterAndSortFor('', '')

            expect( await env.dataProvider.insert(ctx.collectionName, [ctx.entity]) ).toEqual(1)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual([ctx.entity]);
        });

        test('bulk insert data into collection name and query all of it', async () => {
            driver.stubEmptyFilterAndSortFor('', '')

            expect( await env.dataProvider.insert(ctx.collectionName, ctx.entities) ).toEqual(ctx.entities.length)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual(expect.arrayContaining(ctx.entities));
        });

        test('insert entity with number', async () => {
            await env.schemaProvider.create(ctx.numericCollectionName, ctx.numericColumns)
            driver.stubEmptyFilterAndSortFor('', '')

            expect( await env.dataProvider.insert(ctx.numericCollectionName, [ctx.numberEntity]) ).toEqual(1)

            expect( await env.dataProvider.find(ctx.numericCollectionName, '', '', 0, 50) ).toEqual([ctx.numberEntity]);
        });

        test('delete data from collection', async () => {
            await givenCollectionWith(ctx.entities, ctx.collectionName)
            driver.stubEmptyFilterAndSortFor('', '')

            expect( await env.dataProvider.delete(ctx.collectionName, ctx.entities.map(e => e._id)) ).toEqual(ctx.entities.length)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual([]);
        });

        test('allow update for single entity', async () => {
            await givenCollectionWith([ctx.entity], ctx.collectionName)
            driver.stubEmptyFilterAndSortFor('', '')

            expect( await env.dataProvider.update(ctx.collectionName, [ctx.modifiedEntity]) ).toEqual(1)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual([ctx.modifiedEntity]);
        });

        test('allow update for multiple entities', async () => {
            await givenCollectionWith(ctx.entities, ctx.collectionName)
            driver.stubEmptyFilterAndSortFor('', '')

            expect( await env.dataProvider.update(ctx.collectionName, ctx.modifiedEntities) ).toEqual(ctx.modifiedEntities.length)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual(expect.arrayContaining(ctx.modifiedEntities));
        });

        test('if update does not have and updatable fields, do nothing', async () => {
            await givenCollectionWith([ctx.entity], ctx.collectionName)
            delete ctx.modifiedEntity[ctx.column.name]

            expect( await env.dataProvider.update(ctx.collectionName, [ctx.modifiedEntity]) ).toEqual(0)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual([ctx.entity]);
        });

        test('truncate will remove all data from collection', async () => {
            await givenCollectionWith([ctx.entity], ctx.collectionName)
            driver.stubEmptyFilterAndSortFor('', '')

            await env.dataProvider.truncate(ctx.collectionName)

            expect( await env.dataProvider.find(ctx.collectionName, '', '', 0, 50) ).toEqual([]);
        });

        const ctx = {
            collectionName: Uninitialized,
            numericCollectionName: Uninitialized,
            filter: Uninitialized,
            aggregation: Uninitialized,
            sort: Uninitialized,
            skip: Uninitialized,
            limit: Uninitialized,
            column: Uninitialized,
            numericColumns: Uninitialized,
            aliasColumns: Uninitialized,
            entity: Uninitialized,
            numberEntity: Uninitialized,
            anotherNumberEntity: Uninitialized,
            modifiedEntity: Uninitialized,
            anotherEntity: Uninitialized,
            entities: Uninitialized,
            modifiedEntities: Uninitialized,
        };

        beforeEach(async () => {
            ctx.collectionName = gen.randomCollectionName()
            ctx.numericCollectionName = gen.randomCollectionName()
            ctx.column = gen.randomColumn()
            ctx.numericColumns = gen.randomNumberColumns()
            ctx.aliasColumns = ctx.numericColumns.map(() => chance.word())
            ctx.filter = chance.word();
            ctx.aggregation = {processingStep: chance.word(), postFilteringStep: chance.word() }
            ctx.sort = chance.word();
            ctx.skip = 0;
            ctx.limit = 10;

            ctx.entity = gen.randomDbEntity([ctx.column.name]);
            ctx.modifiedEntity = Object.assign({}, ctx.entity, {[ctx.column.name]: chance.word()} )
            ctx.anotherEntity = gen.randomDbEntity([ctx.column.name]);
            ctx.entities = gen.randomDbEntities([ctx.column.name]);
            ctx.modifiedEntities = ctx.entities.map(e => Object.assign({}, e, {[ctx.column.name]: chance.word()} ))
            ctx.numberEntity = gen.randomNumberDbEntity(ctx.numericColumns);
            ctx.anotherNumberEntity = gen.randomNumberDbEntity(ctx.numericColumns);

            await env.schemaProvider.create(ctx.collectionName, [ctx.column])
        });
    })
})
