const {expect} = require('chai')
const {SchemaProvider, SystemFields} = require('./cloud_sql_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const mysql = require('../../../../test/resources/mysql_resources');
const gen = require('../../../../test/drivers/gen');
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

        it('retrieve collection data by collection name', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).to.be.deep.eql({ id: ctx.collectionName,
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

        it('create collection twice will do nothing', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.create(ctx.collectionName, [])
        })

        it('add column on a non existing collection will fail', async () => {
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})
        })

        it('add column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields).to.have.deep.property(ctx.columnName,
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

        it('add duplicate column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})
        })

        it('add system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                        .map(async f => {
                            await env.schemaProvider.addColumn(ctx.collectionName, {name: f, type: 'timestamp'})
                        })
        })

        it('drop column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.describeCollection(ctx.collectionName)).fields).to.not.have.property(ctx.columnName)
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
        columnName: Uninitialized,
    };

    const env = {
        schemaProvider: Uninitialized,
        connectionPool: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = gen.randomCollectionName();
        ctx.columnName = chance.word();
    });

    before(async function() {
        this.timeout(20000)
        env.connectionPool = await mysql.initMySqlEnv()
        env.schemaProvider = new SchemaProvider(env.connectionPool)
    });

    after(async () => {
        await mysql.shutdownMySqlEnv();
    });
})
