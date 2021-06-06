const cloudSql = require('./gcp/sql/cloud_sql_schema_provider')
// const spanner = require('./gcp/spanner/spanner_schema_provider')
const {CollectionDoesNotExists, FieldAlreadyExists, CannotModifySystemField, FieldDoesNotExist} = require('../error/errors')
const { Uninitialized } = require('../../test/commons/test-commons');
const mysql = require('../../test/resources/mysql_resources');
// const resource = require('../../test/resources/spanner_resources');
const gen = require('../../test/drivers/gen');
const Chance = require('chance')
const chance = Chance();
const each = require('jest-each').default
const SystemFields = cloudSql.SystemFields


const env1 = {
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
    return await mysql.shutdownMySqlEnv();
    // await resource.shutSpannerEnv()
}, 20000);

describe('Schema API', () => {

    each([
        ['Cloud Sql', env1],
        // ['Spanner', env2],
    ]).describe('%s', (name, env) => {

        test('list of empty db will result with an empty array', async () => {
            const db = await env.schemaProvider.list()

            expect(db).toEqual([])
        })

        test('create collection with default columns', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.list()
            expect(db).toEqual([{ id: ctx.collectionName,
                displayName: ctx.collectionName,
                allowedOperations: [
                    "get",
                    "find",
                    "count",
                    "update",
                    "insert",
                    "remove"
                ],
                maxPageSize: 50,
                ttl: 3600,
                fields: {
                    _id: {
                        displayName: '_id',
                        type: 'text',
                        queryOperators: [
                            "eq",
                            "lt",
                            "gt",
                            "hasSome",
                            "and",
                            "lte",
                            "gte",
                            "or",
                            "not",
                            "ne",
                            "startsWith",
                            "endsWith"
                        ]
                    },
                    _createdDate: {
                        displayName: '_createdDate',
                        type: 'datetime',
                        queryOperators: [
                            "eq",
                            "lt",
                            "gt",
                            "hasSome",
                            "and",
                            "lte",
                            "gte",
                            "or",
                            "not",
                            "ne",
                            "startsWith",
                            "endsWith"
                        ]
                    },
                    _updatedDate: {
                        displayName: '_updatedDate',
                        type: 'datetime',
                        queryOperators: [
                            "eq",
                            "lt",
                            "gt",
                            "hasSome",
                            "and",
                            "lte",
                            "gte",
                            "or",
                            "not",
                            "ne",
                            "startsWith",
                            "endsWith"
                        ]
                    },
                    _owner: {
                        displayName: '_owner',
                        type: 'text',
                        queryOperators: [
                            "eq",
                            "lt",
                            "gt",
                            "hasSome",
                            "and",
                            "lte",
                            "gte",
                            "or",
                            "not",
                            "ne",
                            "startsWith",
                            "endsWith"
                        ]
                    },
                }
            }])
        })

        test('retrieve collection data by collection name', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).toEqual({ id: ctx.collectionName,
                                        displayName: ctx.collectionName,
                                        allowedOperations: [
                                            "get",
                                            "find",
                                            "count",
                                            "update",
                                            "insert",
                                            "remove"
                                        ],
                                        maxPageSize: 50,
                                        ttl: 3600,
                                        fields: {
                                            _id: {
                                                displayName: '_id',
                                                type: 'text',
                                                queryOperators: [
                                                    "eq",
                                                    "lt",
                                                    "gt",
                                                    "hasSome",
                                                    "and",
                                                    "lte",
                                                    "gte",
                                                    "or",
                                                    "not",
                                                    "ne",
                                                    "startsWith",
                                                    "endsWith"
                                                ]
                                            },
                                            _createdDate: {
                                                displayName: '_createdDate',
                                                type: 'datetime',
                                                queryOperators: [
                                                    "eq",
                                                    "lt",
                                                    "gt",
                                                    "hasSome",
                                                    "and",
                                                    "lte",
                                                    "gte",
                                                    "or",
                                                    "not",
                                                    "ne",
                                                    "startsWith",
                                                    "endsWith"
                                                ]
                                            },
                                            _updatedDate: {
                                                displayName: '_updatedDate',
                                                type: 'datetime',
                                                queryOperators: [
                                                    "eq",
                                                    "lt",
                                                    "gt",
                                                    "hasSome",
                                                    "and",
                                                    "lte",
                                                    "gte",
                                                    "or",
                                                    "not",
                                                    "ne",
                                                    "startsWith",
                                                    "endsWith"
                                                ]
                                            },
                                            _owner: {
                                                displayName: '_owner',
                                                type: 'text',
                                                queryOperators: [
                                                    "eq",
                                                    "lt",
                                                    "gt",
                                                    "hasSome",
                                                    "and",
                                                    "lte",
                                                    "gte",
                                                    "or",
                                                    "not",
                                                    "ne",
                                                    "startsWith",
                                                    "endsWith"
                                                ]
                                            },
                                        }
            })
        })

        test('create collection twice will do nothing', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.create(ctx.collectionName, [])
        })

        test('add column on a non existing collection will fail', async () => {
            await expect(env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime', subtype: 'timestamp'})).rejects.toThrow(CollectionDoesNotExists)
        })

        test('add column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime', subtype: 'timestamp'})

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields).toHaveProperty(ctx.columnName,
                                                                           { displayName: ctx.columnName, type: 'datetime',
                                                                             queryOperators: [
                                                                                 "eq",
                                                                                 "lt",
                                                                                 "gt",
                                                                                 "hasSome",
                                                                                 "and",
                                                                                 "lte",
                                                                                 "gte",
                                                                                 "or",
                                                                                 "not",
                                                                                 "ne",
                                                                                 "startsWith",
                                                                                 "endsWith",
                                                                             ]})
        })

        test('add duplicate column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime', subtype: 'timestamp'})

            await expect(env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime', subtype: 'timestamp'})).rejects.toThrow(FieldAlreadyExists)
        })

        test('add system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                        .map(async f => {
                            await expect(env.schemaProvider.addColumn(ctx.collectionName, {name: f, type: 'datetime', subtype: 'timestamp'})).rejects.toThrow(CannotModifySystemField)
                        })
        })

        test('drop column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'datetime', subtype: 'timestamp'})

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.describeCollection(ctx.collectionName)).fields).not.toHaveProperty(ctx.columnName)
        })

        test('drop column on a a non existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await expect(env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)).rejects.toThrow(FieldDoesNotExist)
        })

        test('drop system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                        .map(async f => {
                            await expect(env.schemaProvider.removeColumn(ctx.collectionName, f)).rejects.toThrow(CannotModifySystemField)
                        })
        })

        const ctx = {
            collectionName: Uninitialized,
            columnName: Uninitialized,
        };

        beforeEach(() => {
            ctx.collectionName = gen.randomCollectionName();
            ctx.columnName = chance.word();
        });
    })
})

