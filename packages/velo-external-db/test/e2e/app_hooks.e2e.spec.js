const { authOwner } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } = require('../resources/e2e_resources')
const gen = require('../gen')
const schema = require('../drivers/schema_api_rest_test_support')
const data = require('../drivers/data_api_rest_test_support')
const hooks = require('../drivers/hooks_test_support')

const { Uninitialized, gen: genCommon } = require('test-commons')

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB hooks: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()

        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    describe('After hooks', () => {
        describe('Write Operations', () => {
            each([
                ['afterInsert', '/data/insert'],
                ['afterBulkInsert', '/data/insert/bulk'],
                ['afterUpdate', '/data/update'],
                ['afterBulkUpdate', '/data/update/bulk'],
                ['afterRemove', '/data/remove'],
                ['afterBulkRemove', '/data/remove/bulk']
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

                env.externalDbRouter.reloadHooks({
                    afterAll: (payload, _requestContext, _serviceContext) => {
                        return { ...payload, [hookName]: false, afterAll: true, afterWrite: false }
                    },
                    afterWrite: (payload, _requestContext, _serviceContext) => {
                        return { ...payload, [hookName]: false, afterWrite: true }
                    },
                    [hookName]: (payload, _requestContext, _serviceContext) => {
                        return { ...payload, [hookName]: true }
                    }
                })

                await expect(axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, ctx.items), authOwner)).resolves.toEqual(
                    expect.objectContaining({ data: expect.objectContaining({ [hookName]: true, afterAll: true, afterWrite: true }) })
                )
            })
        })

        describe('Read Operations', () => {
            each([
                ['afterGetById', '/data/get'],
                ['afterFind', '/data/find'],
                ['afterAggregate', '/data/aggregate'],
                ['afterCount', '/data/count']
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems(ctx.items, ctx.collectionName, authOwner)

                env.externalDbRouter.reloadHooks({
                    afterAll: (payload, _requestContext, _serviceContext) => {
                        return { ...payload, afterAll: true, [hookName]: false }
                    },
                    afterRead: (payload, _requestContext, _serviceContext) => {
                        return { ...payload, afterAll: false, [hookName]: false }
                    },
                    [hookName]: (payload, _requestContext, _serviceContext) => {
                        return { ...payload, [hookName]: true }
                    }
                })

                await expect(axios.post(api, hooks.readRequestBodyWith(ctx.collectionName, ctx.items), authOwner)).resolves.toEqual(
                    expect.objectContaining({ data: expect.objectContaining({ [hookName]: true, afterAll: false }) })
                )
            })
        })
    })

    describe('Before hooks', () => {
        describe('Write Operations', () => {
            each([
                ['beforeInsert', '/data/insert'],
            ]).test.only('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.beforeAllColumn, ctx.beforeWriteColumn, ctx.beforeHookColumn], authOwner)

                console.log('here')
                env.externalDbRouter.reloadHooks({
                    beforeAll: (item, _requestContext, _serviceContext) => {
                        return { ...item, beforeAll: true, beforeWrite: false, beforeHook: false }
                    },
                    beforeWrite: (item, _requestContext, _serviceContext) => {
                        return { ...item, beforeWrite: true, beforeHook: false }
                    },
                    [hookName]: (item, _requestContext, _serviceContext) => {
                        return { ...item, beforeHook: true }
                    }
                })

                await expect(axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).resolves.toEqual(
                    expect.objectContaining({
                        data: {
                            item: expect.objectContaining({
                                beforeAll: true, beforeWrite: true, beforeHook: true
                            })
                        }
                    })
                )
            })
        })


    })
    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        beforeAllColumn: Uninitialized,
        beforeWriteColumn: Uninitialized,
        beforeHookColumn: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.beforeAllColumn = { name: 'beforeAll', type: 'boolean' }
        ctx.beforeWriteColumn = { name: 'beforeWrite', type: 'boolean' }
        ctx.beforeHookColumn = { name: 'beforeHook', type: 'boolean' }
        ctx.item = genCommon.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name]))
        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
