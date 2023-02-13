import each from 'jest-each'
import { authOwner } from '@wix-velo/external-db-testkit'
import { streamToArray } from '@wix-velo/test-commons'
import { dataSpi } from '@wix-velo/velo-external-db-core'
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
            each(['beforeAll', 'beforeRead', 'beforeQuery'])
                .test('%s - query request - should be able to modify the query, omitTotalCount', async(hookName: string) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            [hookName]: (payload: dataSpi.QueryRequest, _requestContext, _serviceContext): dataSpi.QueryRequest => {
                                return { ...payload, omitTotalCount: true, query: { ...payload.query, filter: { _id: { $eq: ctx.item._id } } } }
                            }
                        }
                    })

                    await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, { _id: { $ne: ctx.item._id } })).resolves.toEqual(
                        expect.toIncludeSameMembers([{ item: ctx.item }, data.pagingMetadata(1)]))
                })

            each(['beforeAll', 'beforeRead', 'beforeCount'])
                .test('%s - count request - should be able to modify the query', async(hookName: string) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            [hookName]: (payload: dataSpi.CountRequest, _requestContext, _serviceContext): dataSpi.CountRequest => {
                                return { ...payload, filter: { _id: { $eq: ctx.item._id } } }
                            }
                        }
                    })

                    await expect(axios.post('/data/count', data.countRequest(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)).resolves.toEqual(
                        matchers.responseWith({ totalCount: 1 }))
                })

            if (supportedOperations.includes(Aggregate)) {
                each(['beforeAll', 'beforeRead', 'beforeAggregate'])
                    .test('%s - aggregate request - should be able to modify group, initialFilter and finalFilter', async(hookName) => {
                        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
                        await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authOwner)

                        env.externalDbRouter.reloadHooks({
                            dataHooks: {
                                [hookName]: (payload: dataSpi.AggregateRequest, _requestContext, _serviceContext): dataSpi.AggregateRequest => {
                                    return {
                                        ...payload,
                                        group: { ...payload.group, by: [...payload.group.by, '_owner'] },
                                        initialFilter: { _id: { $eq: ctx.numberItem._id } },
                                        finalFilter: { myAvg: { $gt: 0 } },
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
                                finalFilter: {
                                    $and: [
                                        { myAvg: { $lt: 0 } },
                                    ],
                                },
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
    })

    describe('After Hooks', () => {
        describe('Read Operations', () => {
            each(['afterAll', 'afterRead', 'afterQuery'])
                .test('%s - query request - should be able to modify query response', async(hookName: string) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            [hookName]: (payload: { items: ItemWithId[], totalCount?: number }, _requestContext, _serviceContext): { items: ItemWithId[], totalCount?: number } => {
                                return { ...payload, items: [{ ...ctx.item, _owner: 'me' }] }
                            }
                        }
                    })

                    await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(
                        expect.toIncludeSameMembers([{ item: { ...ctx.item, _owner: 'me' } }, data.pagingMetadata(1, 1)]))
                })

            each(['afterAll', 'afterRead', 'afterCount'])
                .test('%s - count request - should be able to modify count response', async(hookName: string) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            [hookName]: (payload: dataSpi.CountResponse, _requestContext, _serviceContext): dataSpi.CountResponse => {
                                return { ...payload, totalCount: 0 }
                            }
                        }
                    })

                    await expect(axios.post('/data/count', data.countRequest(ctx.collectionName), authOwner)).resolves.toEqual(
                        matchers.responseWith({ totalCount: 0 }))
                })

            if (supportedOperations.includes(Aggregate)) {
                each(['afterAll', 'afterRead', 'afterAggregate'])
                    .test('%s - aggregate request - should be able to modify response', async(hookName) => {
                        await schema.givenCollection(ctx.collectionName, ctx.numberColumns, authOwner)
                        await data.givenItems([ctx.numberItem, ctx.anotherNumberItem], ctx.collectionName, authOwner)

                        env.externalDbRouter.reloadHooks({
                            dataHooks: {
                                [hookName]: (payload: { items: ItemWithId[]; totalCount?: number }, _requestContext, _serviceContext): { items: ItemWithId[]; totalCount?: number } => {
                                    return {
                                        ...payload,
                                        items: payload.items.map((item => ({ ...item, _owner: 'me' })))
                                    }
                                }
                            }
                        })

                        const response = await axios.post('/data/aggregate',
                            {
                                collectionId: ctx.collectionName,
                                initialFilter: { _id: { $eq: ctx.numberItem._id } },
                                group: {
                                    by: ['_id', '_owner'], aggregation: [
                                        {
                                            name: 'myAvg',
                                            avg: ctx.numberColumns[0].name
                                        }
                                    ]
                                },
                            }, { responseType: 'stream', ...authOwner })

                        await expect(streamToArray(response.data)).resolves.toEqual(
                            expect.toIncludeSameMembers([{
                                item: {
                                    _id: ctx.numberItem._id,
                                    _owner: 'me',
                                    myAvg: ctx.numberItem[ctx.numberColumns[0].name],
                                }
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
        beforeAllColumn: InputField
        beforeReadColumn: InputField
        beforeWriteColumn: InputField
        beforeHookColumn: InputField
        numberColumns: InputField[]
    }

    const ctx: Ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        item: Uninitialized,
        items: Uninitialized,
        numberItem: Uninitialized,
        anotherNumberItem: Uninitialized,
        beforeAllColumn: Uninitialized,
        beforeReadColumn: Uninitialized,
        beforeWriteColumn: Uninitialized,
        beforeHookColumn: Uninitialized,
        numberColumns: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.beforeAllColumn = { name: 'beforeAll', type: 'boolean' }
        ctx.beforeWriteColumn = { name: 'beforeWrite', type: 'boolean' }
        ctx.beforeReadColumn = { name: 'beforeRead', type: 'boolean' }
        ctx.beforeHookColumn = { name: 'beforeHook', type: 'boolean' }
        ctx.item = genCommon.randomEntity([ctx.column.name]) as ItemWithId
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name])) as ItemWithId[]

        ctx.numberColumns = gen.randomNumberColumns()
        ctx.numberItem = genCommon.randomNumberEntity(ctx.numberColumns) as ItemWithId
        ctx.anotherNumberItem = genCommon.randomNumberEntity(ctx.numberColumns) as ItemWithId

        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
