const { authOwner, errorResponseWith } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env, supportedOperations } = require('../resources/e2e_resources')
const { Aggregate } = require('@wix-velo/velo-external-db-commons').SchemaOperations
const gen = require('../gen')
const schema = require('../drivers/schema_api_rest_test_support')
const data = require('../drivers/data_api_rest_test_support')
const hooks = require('../drivers/hooks_test_support')

const { Uninitialized, gen: genCommon } = require('@wix-velo/test-commons')

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB Data Hooks: ${currentDbImplementationName()}`, () => {
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
                    dataHooks: {
                        afterAll: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: false, afterAll: true, afterWrite: false }
                        },
                        afterWrite: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: false, afterWrite: true }
                        },
                        [hookName]: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: true }
                        }
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
                    dataHooks: {
                        afterAll: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, afterAll: true, [hookName]: false }
                        },
                        afterRead: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, afterAll: false, [hookName]: false }
                        },
                        [hookName]: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: true }
                        }
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
                    dataHooks: {
                        beforeAll: (payload, _requestContext, _serviceContext) => (
                            { ...payload, item: { ...payload.item, beforeAll: true, beforeWrite: false, beforeHook: false } }
                        ),
                        beforeWrite: (payload, _requestContext, _serviceContext) => (
                            { ...payload, item: { ...payload.item, beforeWrite: true, beforeHook: false } }
                        ),
                        [hookName]: ({ item }, _requestContext, _serviceContext) => ({
                            item: { ...item, beforeHook: true }
                        })
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

            each([
                ['beforeBulkInsert', '/data/insert/bulk'],
                ['beforeBulkUpdate', '/data/update/bulk'],
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.beforeAllColumn, ctx.beforeWriteColumn, ctx.beforeHookColumn], authOwner)
                if (hookName !== 'beforeBulkInsert') {
                    await data.givenItems(ctx.items, ctx.collectionName, authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (payload, _requestContext, _serviceContext) => (
                            { ...payload, items: payload.items.map(item => ({ ...item, beforeAll: true, beforeWrite: false, beforeHook: false })) }
                        ),
                        beforeWrite: (payload, _requestContext, _serviceContext) => (
                            { ...payload, items: payload.items.map(item => ({ ...item, beforeWrite: true, beforeHook: false })) }
                        ),
                        [hookName]: ({ items }, _requestContext, _serviceContext) => ({
                            items: items.map(item => ({ ...item, beforeHook: true }))
                        })
                    }
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
                        dataHooks: {
                            [hookName]: (payload, _requestContext, _serviceContext) => {
                                if (payload.itemId === ctx.item._id) {
                                    throw ('Should not be removed')
                                }
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
                        dataHooks: {
                            [hookName]: (payload, _requestContext, _serviceContext) => {
                                if (payload.itemIds[0] === ctx.items[0]._id) {
                                    throw ('Should not be removed')
                                }
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
                        dataHooks: {
                            [hookName]: (payload, _requestContext, _serviceContext) => {
                                return { ...payload, filter: { _id: { $eq: ctx.item._id } } }
                            },
                        }
                    })

                    const response = await axios.post('/data/find', hooks.findRequestBodyWith(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)
                    expect(response.data.items).toEqual([ctx.item])
                })

            test('beforeFind should be able to change projection payload /data/find', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeFind: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, projection: ['_id'] }
                        }
                    }
                })

                const response = await axios.post('/data/find', hooks.findRequestBodyWith(ctx.collectionName, { _id: { $eq: ctx.item._id } }), authOwner)
                expect(response.data.items).toEqual([{ _id: ctx.item._id }])

            })
            each(['beforeAll', 'beforeRead', 'beforeGetById'])
                .test('%s should able to change payload /data/get', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            [hookName]: (_payload, _requestContext, _serviceContext) => ({
                                itemId: ctx.item._id
                            })
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
                        dataHooks: {
                            [hookName]: (payload, _requestContext, _serviceContext) => {
                                return { ...payload, filter: { _id: { $eq: ctx.item._id } } }
                            }
                        }
                    })

                    const response = await axios.post('/data/count', hooks.findRequestBodyWith(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)
                    expect(response.data.totalCount).toEqual(1)
                })

            if (supportedOperations.includes(Aggregate)) {
                each(['beforeAll', 'beforeRead', 'beforeAggregate'])
                    .test('%s should able to change payload /data/aggregate', async(hookName) => {
                        if (hooks.skipAggregationIfNotSupported(hookName, supportedOperations))
                            return

                        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                        await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                        env.externalDbRouter.reloadHooks({
                            dataHooks: {
                                [hookName]: (payload, _requestContext, _serviceContext) => {
                                    return { ...payload, filter: { _id: { $eq: ctx.item._id } } }
                                }
                            }
                        })

                        const response = await axios.post('/data/aggregate', hooks.aggregateRequestBodyWith(ctx.collectionName, { $filter: { _id: { $ne: ctx.item._id } } }), authOwner)
                        expect(response.data.items).toEqual([{ _id: ctx.item._id }])
                    })
            }
        })
    })

    describe('Error Handling', () => {
        test('should handle error object and throw with the corresponding status', async() => {
            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        const error = new Error('message')
                        error.status = '409'
                        throw error
                    }
                }
            })

            await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith(409, 'message')
            )
        })

        test('If not specified should throw 400 - Error object', async() => {
            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        const error = new Error('message')
                        throw error
                    }
                }
            })

            await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith(400, 'message')
            )
        })

        test('If not specified should throw 400 - string', async() => {
            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        throw 'message'
                    }
                }
            })

            await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith(400, 'message')
            )
        })
    })


    describe('Custom Context', () => {
        describe('Read operations', () => {
            each([
                ['Get', 'beforeGetById', 'afterGetById', '/data/get'],
                ['Find', 'beforeFind', 'afterFind', '/data/find'],
                ['Aggregate', 'beforeAggregate', 'afterAggregate', '/data/aggregate'],
                ['Count', 'beforeCount', 'afterCount', '/data/count']
            ]).test('customContext should pass by ref on [%s] ', async(_, beforeHook, afterHook, api) => {
                if (hooks.skipAggregationIfNotSupported(beforeHook, supportedOperations))
                    return

                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems(ctx.items, ctx.collectionName, authOwner)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.beforeAll = true
                        },
                        beforeRead: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.beforeRead = true
                        },
                        [beforeHook]: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext[beforeHook] = true
                        },
                        afterAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.afterAll = true
                        },
                        afterRead: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.afterRead = true
                        },
                        [afterHook]: (payload, _requestContext, _serviceContext, customContext) => {
                            customContext[afterHook] = true
                            return { ...payload, customContext }
                        }
                    }
                })
                const response = await axios.post(api, hooks.readRequestBodyWith(ctx.collectionName, ctx.items), authOwner)
                expect(response.data.customContext).toEqual({
                    beforeAll: true, beforeRead: true, [beforeHook]: true, afterAll: true, afterRead: true, [afterHook]: true
                })
            })
        })

        describe('Write operations', () => {
            each([
                ['Insert', 'beforeInsert', 'afterInsert', '/data/insert'],
                ['Bulk Insert', 'beforeBulkInsert', 'afterBulkInsert', '/data/insert/bulk'],
                ['Update', 'beforeUpdate', 'afterUpdate', '/data/update'],
                ['Bulk Update', 'beforeBulkUpdate', 'afterBulkUpdate', '/data/update/bulk'],
                ['Remove', 'beforeRemove', 'afterRemove', '/data/remove'],
                ['Bulk Remove', 'beforeBulkRemove', 'afterBulkRemove', '/data/remove/bulk']
            ]).test('customContext should pass by ref on [%s] ', async(_, beforeHook, afterHook, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                if (!['afterInsert', 'afterBulkInsert'].includes(afterHook)) {
                    await data.givenItems(ctx.items, ctx.collectionName, authOwner)
                }
                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.beforeAll = true
                        },
                        beforeWrite: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.beforeWrite = true
                        },
                        [beforeHook]: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext[beforeHook] = true
                        },
                        afterAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.afterAll = true
                        },
                        afterWrite: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext.afterWrite = true
                        },
                        [afterHook]: (payload, _requestContext, _serviceContext, customContext) => {
                            customContext[afterHook] = true
                            return { ...payload, customContext }
                        }
                    }
                })
                const response = await axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, ctx.items), authOwner)
                expect(response.data.customContext).toEqual({
                    beforeAll: true, beforeWrite: true, [beforeHook]: true, afterAll: true, afterWrite: true, [afterHook]: true
                })
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
