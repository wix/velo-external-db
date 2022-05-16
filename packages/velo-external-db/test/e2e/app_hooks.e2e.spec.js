const { authOwner, errorResponseWith } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env, supportedOperations } = require('../resources/e2e_resources')
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
                if (!['afterInsert', 'afterBulkInsert'].includes(hookName)) {
                    await data.givenItems(ctx.items, ctx.collectionName, authOwner)
                }

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
                if (hooks.skipAggregationIfNotSupported(hookName, supportedOperations))
                    return

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
                ['beforeUpdate', '/data/update'],
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.beforeAllColumn, ctx.beforeWriteColumn, ctx.beforeHookColumn], authOwner)
                if (hookName !== 'beforeInsert') {
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    beforeAll: (item, _requestContext, _serviceContext) => (
                        { ...item, beforeAll: true, beforeWrite: false, beforeHook: false }
                    ),
                    beforeWrite: (item, _requestContext, _serviceContext) => (
                        { ...item, beforeWrite: true, beforeHook: false }
                    ),
                    [hookName]: (item, _requestContext, _serviceContext) => (
                        { ...item, beforeHook: true }
                    )
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

            each([
                ['beforeBulkInsert', '/data/insert/bulk'],
                ['beforeBulkUpdate', '/data/update/bulk'],
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.beforeAllColumn, ctx.beforeWriteColumn, ctx.beforeHookColumn], authOwner)
                if (hookName !== 'beforeBulkInsert') {
                    await data.givenItems(ctx.items, ctx.collectionName, authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    beforeAll: (items, _requestContext, _serviceContext) => (
                        items.map(item => ({ ...item, beforeAll: true, beforeWrite: false, beforeHook: false }))
                    ),
                    beforeWrite: (items, _requestContext, _serviceContext) => (
                        items.map(item => ({ ...item, beforeWrite: true, beforeHook: false }))
                    ),
                    [hookName]: (items, _requestContext, _serviceContext) => (
                        items.map(item => ({ ...item, beforeHook: true }))
                    )
                })

                await expect(axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, ctx.items), authOwner)).resolves.toEqual(
                    expect.objectContaining({
                        data: {
                            items: ctx.items.map(item => ({
                                ...item, beforeAll: true, beforeWrite: true, beforeHook: true
                            }))
                        }
                    })
                )
            })

            each(['beforeAll', 'beforeWrite', 'beforeRemove'])
                .test('hook %s with data/remove/bulk api should throw 400 with the appropriate message if hook throwing', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        [hookName]: (itemId, _requestContext, _serviceContext) => {
                            if (itemId === ctx.item._id) {
                                throw ('Should not be removed')
                            }
                        }
                    })

                    await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                        errorResponseWith(400, 'Should not be removed')
                    )
                })

            each(['beforeAll', 'beforeWrite', 'beforeBulkRemove'])
                .test('hook %s with data/remove/bulk api should throw 400 with the appropriate message if hook throwing', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems(ctx.items, ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        [hookName]: (itemIds, _requestContext, _serviceContext) => {
                            if (itemIds[0] === ctx.items[0]._id) {
                                throw ('Should not be removed')
                            }
                        }
                    })

                    await expect(axios.post('/data/remove/bulk', hooks.writeRequestBodyWith(ctx.collectionName, ctx.items), authOwner)).rejects.toMatchObject(
                        errorResponseWith(400, 'Should not be removed')
                    )
                })
        })

        describe('Read Operations', () => {
            each(['beforeAll', 'beforeRead', 'beforeFind'])
                .test('%s should able to change filter payload /data/find', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        [hookName]: (query, _requestContext, _serviceContext) => {
                            return { ...query, filter: { _id: { $eq: ctx.item._id } } }
                        },
                    })

                    const response = await axios.post('/data/find', hooks.findRequestBodyWith(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)
                    expect(response.data.items).toEqual([ctx.item])
                })

            each(['beforeAll', 'beforeRead', 'beforeGetById'])
                .test('%s should able to change payload /data/get', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        [hookName]: (_id, _requestContext, _serviceContext) => {
                            return ctx.item._id
                        }
                    })

                    const response = await axios.post('/data/get', hooks.getRequestBodyWith(ctx.collectionName, 'wrongId'), authOwner)
                    expect(response.data.item).toEqual(ctx.item)
                })

            each(['beforeAll', 'beforeRead', 'beforeCount'])
                .test('%s should able to change payload /data/count', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        [hookName]: (filter, _requestContext, _serviceContext) => {
                            return { ...filter, _id: { $eq: ctx.item._id } }
                        }
                    })

                    const response = await axios.post('/data/count', hooks.findRequestBodyWith(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)
                    expect(response.data.totalCount).toEqual(1)
                })

            each(['beforeAll', 'beforeRead', 'beforeAggregate'])
                .test('%s should able to change payload /data/aggregate', async(hookName) => {
                    if (hooks.skipAggregationIfNotSupported(hookName, supportedOperations))
                        return
                    
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        [hookName]: (query, _requestContext, _serviceContext) => {
                            return { ...query, filter: { _id: { $eq: ctx.item._id } } }
                        }
                    })

                    const response = await axios.post('/data/aggregate', hooks.aggregateRequestBodyWith(ctx.collectionName, { $filter: { _id: { $ne: ctx.item._id } } }), authOwner)
                    expect(response.data.items).toEqual([{ _id: ctx.item._id }])
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
        ctx.beforeReadColumn = { name: 'beforeRead', type: 'boolean' }
        ctx.beforeHookColumn = { name: 'beforeHook', type: 'boolean' }
        ctx.item = genCommon.randomEntity([ctx.column.name])
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name]))
        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
