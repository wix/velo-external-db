import { authOwner } from '@wix-velo/external-db-testkit'
import { streamToArray } from '@wix-velo/test-commons'
import { dataSpi, types as coreTypes } from '@wix-velo/velo-external-db-core'
import { InputField, ItemWithId, SchemaOperations } from '@wix-velo/velo-external-db-types'
import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env, supportedOperations } from '../resources/e2e_resources'
import gen = require('../gen')
import schema = require('../drivers/schema_api_rest_test_support')
import * as data from '../drivers/data_api_rest_test_support'
import hooks = require('../drivers/hooks_test_support_v3')
import * as matchers from '../drivers/schema_api_rest_matchers'

const { Aggregate } = SchemaOperations


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

    describe('Before Hooks', () => {
        describe('Read Operations', () => {
            test('before query request - should be able to modify the request, specific hooks should overwrite non-specific', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)


                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.item._id)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (payload: dataSpi.QueryRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, omitTotalCount: true, query: { ...payload.query, filter: { _id: { $eq: idPart1 } } }
                            }
                        },
                        beforeRead: (payload: dataSpi.QueryRequest, _requestContext, _serviceContext) => {
                            return {
                                ...hooks.concatToProperty(payload, 'query.filter._id.$eq', idPart2),
                            }
                        },
                        beforeQuery: (payload: dataSpi.QueryRequest, _requestContext, _serviceContext) => {
                            return {
                                ...hooks.concatToProperty(payload, 'query.filter._id.$eq', idPart3),
                            }
                        }
                    }
                })

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, { _id: { $ne: ctx.item._id } })).resolves.toEqual(
                    expect.toIncludeSameMembers([{ item: ctx.item }, data.pagingMetadata(1)]))
            })

            test('before count request - should be able to modify the query, specific hooks should overwrite non-specific', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.item._id)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (payload: dataSpi.QueryRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, filter: { _id: { $eq: idPart1 } }
                            }
                        },
                        beforeRead: (payload: dataSpi.QueryRequest, _requestContext, _serviceContext) => {
                            return {
                                ...hooks.concatToProperty(payload, 'filter._id.$eq', idPart2),
                            }
                        },
                        beforeCount: (payload: dataSpi.CountRequest, _requestContext, _serviceContext): dataSpi.CountRequest => {
                            return {
                                ...hooks.concatToProperty(payload, 'filter._id.$eq', idPart3),
                            }
                        }
                    }
                })

                await expect(axios.post('/data/count', data.countRequest(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)).resolves.toEqual(
                    matchers.responseWith({ totalCount: 1 }))
            })

            if (supportedOperations.includes(Aggregate)) {
                test('before aggregate request - should be able to modify group, initialFilter and finalFilter', async() => {
                    await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
                    await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            beforeAll: (payload: dataSpi.AggregateRequest, _requestContext, _serviceContext): dataSpi.AggregateRequest => {
                                return {
                                    ...payload,
                                    group: { ...payload.group, by: [] },
                                    initialFilter: { _id: { $eq: ctx.numberItem._id } },
                                }
                            },
                            beforeRead: (payload: dataSpi.AggregateRequest, _requestContext, _serviceContext): dataSpi.AggregateRequest => {
                                return {
                                    ...payload,
                                    group: { ...payload.group, by: ['_id'] },
                                    finalFilter: { myAvg: { $gt: 0 } },
                                }
                            },
                            beforeAggregate: (payload: dataSpi.AggregateRequest, _requestContext, _serviceContext): dataSpi.AggregateRequest => {
                                return {
                                    ...payload,
                                    group: { ...payload.group, by: ['_id', '_owner'] },
                                }
                            }
                        }
                    })

                    const response = await axios.post('/data/aggregate',
                        {
                            collectionId: ctx.collectionName,
                            initialFilter: { _id: { $ne: ctx.numberItem._id } },
                            group: {
                                by: ['_id'], aggregation: [
                                    {
                                        name: 'myAvg',
                                        avg: ctx.numberColumns[0].name
                                    },
                                    {
                                        name: 'mySum',
                                        sum: ctx.numberColumns[1].name
                                    }
                                ]
                            },
                            finalFilter: { myAvg: { $lt: 0 } },
                        }, { responseType: 'stream', ...authOwner })

                    await expect(streamToArray(response.data)).resolves.toEqual(
                        expect.toIncludeSameMembers([{
                            item: {
                                _id: ctx.numberItem._id,
                                _owner: ctx.numberItem._owner,
                                myAvg: ctx.numberItem[ctx.numberColumns[0].name],
                                mySum: ctx.numberItem[ctx.numberColumns[1].name]
                            }
                        },
                        data.pagingMetadata(1, 1)
                        ]))

                })


            }
        })
        describe('Write Operations', () => {
            test('before insert request - should be able to modify the item', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.afterAllColumn, ctx.afterWriteColumn, ctx.afterHookColumn], authOwner)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (_payload, requestContext: coreTypes.RequestContext, _serviceContext) => {
                            if (requestContext.operation === coreTypes.DataOperationsV3.Insert) {
                                const payload = _payload as dataSpi.InsertRequest
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterAllColumn.name]: true,
                                        [ctx.afterWriteColumn.name]: false,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            }
                        },
                        beforeWrite: (_payload, requestContext: coreTypes.RequestContext, _serviceContext) => {
                            if (requestContext.operation === coreTypes.DataOperationsV3.Insert) {
                                const payload = _payload as dataSpi.InsertRequest
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterWriteColumn.name]: true,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            }
                        },
                        beforeInsert: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterHookColumn.name]: true,
                                }))
                            }
                        }
                    }
                })

                await axios.post('/data/insert', data.insertRequest(ctx.collectionName, [ctx.item], false), authOwner)

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(
                    expect.toIncludeSameMembers([{
                        item: {
                            ...ctx.item,
                            [ctx.afterAllColumn.name]: true,
                            [ctx.afterWriteColumn.name]: true,
                            [ctx.afterHookColumn.name]: true,
                        }
                    }, data.pagingMetadata(1, 1)])
                )
            })
        })
    })

    describe('After Hooks', () => {
        describe('Read Operations', () => {
            test('after query request - should be able to modify query response', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.afterAllColumn, ctx.afterReadColumn, ctx.afterHookColumn], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        afterAll: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterAllColumn.name]: true,
                                    [ctx.afterReadColumn.name]: false,
                                    [ctx.afterHookColumn.name]: false,
                                }))
                            }
                        },
                        afterRead: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterReadColumn.name]: true,
                                    [ctx.afterHookColumn.name]: false,
                                }))
                            }
                        },
                        afterQuery: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterHookColumn.name]: true,
                                }))
                            }
                        }
                    }
                })

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(
                    expect.toIncludeSameMembers([{
                        item: {
                            ...ctx.item,
                            [ctx.afterAllColumn.name]: true,
                            [ctx.afterHookColumn.name]: true,
                            [ctx.afterReadColumn.name]: true,
                        }
                    }, data.pagingMetadata(1, 1)]))
            })

            test('after count request - should be able to modify count response', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        afterAll: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, totalCount: payload.totalCount + 2 }
                        },
                        afterRead: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, totalCount: payload.totalCount * 2 }
                        },
                        afterCount: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, totalCount: payload.totalCount - 3 }
                        }
                    }
                })

                await expect(axios.post('/data/count', data.countRequest(ctx.collectionName), authOwner)).resolves.toEqual(
                    matchers.responseWith({ totalCount: 3 }))
            })

            if (supportedOperations.includes(Aggregate)) {
                test('after aggregate request - should be able to modify response', async() => {
                    await schema.givenCollection(ctx.collectionName, [ctx.afterAllColumn, ctx.afterReadColumn, ctx.afterHookColumn], authOwner)
                    await data.givenItems([{ ...ctx.item, [ctx.afterAllColumn.name]: false, [ctx.afterReadColumn.name]: false, [ctx.afterHookColumn.name]: false }],
                        ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            afterAll: (payload, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterAllColumn.name]: true,
                                        [ctx.afterReadColumn.name]: false,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            },
                            afterRead: (payload, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterReadColumn.name]: true,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            },
                            afterAggregate: (payload, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterHookColumn.name]: true,
                                    }))
                                }
                            }
                        }
                    })

                    const response = await axios.post('/data/aggregate',
                        {
                            collectionId: ctx.collectionName,
                            initialFilter: { _id: { $eq: ctx.item._id } },
                            group: {
                                by: [ctx.afterAllColumn.name, ctx.afterReadColumn.name, ctx.afterHookColumn.name],
                                aggregation: []
                            },
                            finalFilter: {},
                        }, { responseType: 'stream', ...authOwner })

                    await expect(streamToArray(response.data)).resolves.toEqual(
                        expect.toIncludeSameMembers([{
                            item: expect.objectContaining({
                                [ctx.afterAllColumn.name]: true,
                                [ctx.afterHookColumn.name]: true,
                                [ctx.afterReadColumn.name]: true,
                            })
                        },
                        data.pagingMetadata(1, 1)
                        ]))

                })


            }
        })
    })

    interface Ctx {
        collectionName: string
        column: InputField
        item: ItemWithId
        items: ItemWithId[]
        numberItem: ItemWithId
        anotherNumberItem: ItemWithId
        afterAllColumn: InputField
        afterReadColumn: InputField
        afterWriteColumn: InputField
        afterHookColumn: InputField
        numberColumns: InputField[]
    }

    const ctx: Ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        numberItem: Uninitialized,
        anotherNumberItem: Uninitialized,
        afterAllColumn: Uninitialized,
        afterReadColumn: Uninitialized,
        afterWriteColumn: Uninitialized,
        afterHookColumn: Uninitialized,
        numberColumns: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.afterAllColumn = { name: 'afterAll', type: 'boolean' }
        ctx.afterWriteColumn = { name: 'afterWrite', type: 'boolean' }
        ctx.afterReadColumn = { name: 'afterRead', type: 'boolean' }
        ctx.afterHookColumn = { name: 'afterHook', type: 'boolean' }
        ctx.item = genCommon.randomEntity([ctx.column.name]) as ItemWithId
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name])) as ItemWithId[]

        ctx.numberColumns = gen.randomNumberColumns()
        ctx.numberItem = genCommon.randomNumberEntity(ctx.numberColumns) as ItemWithId
        ctx.anotherNumberItem = genCommon.randomNumberEntity(ctx.numberColumns) as ItemWithId

        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
