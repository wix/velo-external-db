const mysql = require('external-db-mysql')
const postgres = require('external-db-postgres')
const {CollectionDoesNotExists, FieldAlreadyExists, CannotModifySystemField, FieldDoesNotExist} = require('velo-external-db-commons')
const { Uninitialized, gen } = require('test-commons')
const mysqlTestEnv = require('../resources/mysql_resources');
const postgresTestEnv = require('../resources/postgres_resources');
const Chance = require('chance')
const chance = Chance();
const each = require('jest-each').default
const SystemFields = mysql.SystemFields


const env1 = {
    schemaProvider: Uninitialized,
    connectionPool: Uninitialized,
    schemaColumnTranslator: Uninitialized,
};

const env2 = {
    schemaProvider: Uninitialized,
    connectionPool: Uninitialized,
    schemaColumnTranslator: Uninitialized,
};

const mySqlTestEnvInit = async () => {
    env1.connectionPool = await mysqlTestEnv.initMySqlEnv()
    env1.schemaProvider = new mysql.SchemaProvider(env1.connectionPool)
    env1.schemaColumnTranslator = new mysql.SchemaColumnTranslator()
}

const postgresTestEnvInit = async () => {
    env2.connectionPool = await postgresTestEnv.initEnv()
    env2.schemaProvider = new postgres.SchemaProvider(env2.connectionPool)
    env2.schemaColumnTranslator = new postgres.SchemaColumnTranslator()
}

beforeAll(async () => {
    await mySqlTestEnvInit()
    await postgresTestEnvInit()
}, 20000);


afterAll(async () => {
    if (env2.connectionPool) {
        await env2.connectionPool.end()
    }
    await postgresTestEnv.shutdownEnv();
    return await mysqlTestEnv.shutdownMySqlEnv();
}, 20000);

describe('Schema API', () => {

    each([
        ['MySql', env1],
        ['Postgres', env2],
    ]).describe('%s', (name, env) => {

        test('list of empty db will result with an empty array', async () => {
            const db = await env.schemaProvider.list()

            expect(db).toEqual([])
        })

        test('list db will result with a list of wix databases', async () => {
            await env.schemaProvider.create(ctx.collectionName)
            await env.schemaProvider.create(ctx.anotherCollectionName)

            const dbs = await env.schemaProvider.list()

            expect(dbs).toEqual(expect.arrayContaining([
                                    env.schemaProvider.asWixSchema([{ field: '_id', type: env.schemaColumnTranslator.dbType('text', 'string', 50) },
                                                                    { field: '_createdDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                                    { field: '_updatedDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                                    { field: '_owner', type: env.schemaColumnTranslator.dbType('text', 'string', 50)}], ctx.collectionName),
                                    env.schemaProvider.asWixSchema([{ field: '_id', type: env.schemaColumnTranslator.dbType('text', 'string', 50)},
                                                                    { field: '_createdDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                                    { field: '_updatedDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                                    { field: '_owner', type: env.schemaColumnTranslator.dbType('text', 'string', 50)}], ctx.anotherCollectionName),
            ]))
        })

        test('create collection with default columns', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).toEqual(env.schemaProvider.asWixSchema([{ field: '_id', type: env.schemaColumnTranslator.dbType('text', 'string', 50)},
                                                               { field: '_createdDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                               { field: '_updatedDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                               { field: '_owner', type: env.schemaColumnTranslator.dbType('text', 'string', 50)}], ctx.collectionName))
        })

        test('collection name and variables are case sensitive', async () => {
            await env.schemaProvider.create(ctx.collectionName.toUpperCase())

            const db = await env.schemaProvider.describeCollection(ctx.collectionName.toUpperCase())
            expect(db).toEqual(env.schemaProvider.asWixSchema([{ field: '_id', type: env.schemaColumnTranslator.dbType('text', 'string', 50)},
                                                               { field: '_createdDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                               { field: '_updatedDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                               { field: '_owner', type: env.schemaColumnTranslator.dbType('text', 'string', 50)}], ctx.collectionName.toUpperCase()))
        })

        test('retrieve collection data by collection name', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).toEqual(env.schemaProvider.asWixSchema([{ field: '_id', type: env.schemaColumnTranslator.dbType('text', 'string', 50)},
                                                               { field: '_createdDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                               { field: '_updatedDate', type: env.schemaColumnTranslator.dbType('datetime', 'datetime')},
                                                               { field: '_owner', type: env.schemaColumnTranslator.dbType('text', 'string', 50)}], ctx.collectionName))
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
                        .forEach(async f => {
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
                        .forEach(async f => {
                            await expect(env.schemaProvider.removeColumn(ctx.collectionName, f)).rejects.toThrow(CannotModifySystemField)
                        })
        })

        const ctx = {
            collectionName: Uninitialized,
            anotherCollectionName: Uninitialized,
            columnName: Uninitialized,
        };

        beforeEach(() => {
            ctx.collectionName = gen.randomCollectionName()
            ctx.anotherCollectionName = gen.randomCollectionName()
            ctx.columnName = chance.word()
        });
    })
})

