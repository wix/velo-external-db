import { authOwner, errorResponseWith } from '@wix-velo/external-db-testkit'
import { streamToArray, testIfSupportedOperationsIncludes, testSupportedOperations } from '@wix-velo/test-commons'
import { dataSpi, types as coreTypes, collectionSpi } from '@wix-velo/velo-external-db-core'
import { DataOperation, InputField, ItemWithId, SchemaOperations } from '@wix-velo/velo-external-db-types'
import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env, supportedOperations } from '../resources/e2e_resources'
import gen = require('../gen')
import schema = require('../drivers/schema_api_rest_test_support')
import * as data from '../drivers/data_api_rest_test_support'
import hooks = require('../drivers/hooks_test_support')
import * as matchers from '../drivers/schema_api_rest_matchers'
import each from 'jest-each'

const { Aggregate, UpdateImmediately, DeleteImmediately } = SchemaOperations


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
            each(testSupportedOperations(supportedOperations, 
                [
                    ['insert', 'beforeInsert', '/data/insert'],
                    ['update', 'beforeUpdate', '/data/update', { neededOperations: [UpdateImmediately] }],
                ]
                )).test('before %s request - should be able to modify the item', async(operation, hookName, api) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.afterAllColumn, ctx.afterWriteColumn, ctx.afterHookColumn], authOwner)
                    if (operation !== 'insert') {
                        await data.givenItems([ctx.item], ctx.collectionName, authOwner)
                    }

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            beforeAll: (payload, requestContext: coreTypes.RequestContext, _serviceContext) => {
                                if (requestContext.operation !== DataOperation.query) {
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
                            beforeWrite: (payload, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterWriteColumn.name]: true,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            },
                            [hookName]: (payload, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterHookColumn.name]: true,
                                    }))
                                }
                            }
                        }
                    })

                    await axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)

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

            testIfSupportedOperationsIncludes(supportedOperations, [ DeleteImmediately ])('before remove request - should be able to modify the item id', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.item._id)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (payload: dataSpi.RemoveRequest, requestContext: coreTypes.RequestContext, _serviceContext) => {
                            if (requestContext.operation !== DataOperation.query) {
                                return {
                                    ...payload, itemIds: [idPart1]
                                }
                            }
                        },
                        beforeWrite: (payload: dataSpi.RemoveRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, itemIds: [`${payload.itemIds[0]}${idPart2}`]
                            }
                        },
                        beforeRemove: (payload: dataSpi.RemoveRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, itemIds: [`${payload.itemIds[0]}${idPart3}`]
                            }
                        }
                    }
                })

                await axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.numberItem]), authOwner)

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(
                    expect.toIncludeSameMembers([data.pagingMetadata(0, 0)])
                )
            })

            test('before truncate request - should be able to modify the collection name', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                const [collectionIdPart1, collectionIdPart2, collectionIdPart3] = hooks.splitIdToThreeParts(ctx.collectionName)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        beforeAll: (payload: dataSpi.TruncateRequest, requestContext: coreTypes.RequestContext, _serviceContext) => {
                            if (requestContext.operation !== DataOperation.query) {
                                return { ...payload, collectionId: collectionIdPart1 }
                            }
                        },
                        beforeWrite: (payload: dataSpi.TruncateRequest, _requestContext, _serviceContext) => {
                            return hooks.concatToProperty(payload, 'collectionId', collectionIdPart2)
                        },
                        beforeTruncate: (payload: dataSpi.TruncateRequest, _requestContext, _serviceContext) => {
                            return hooks.concatToProperty(payload, 'collectionId', collectionIdPart3)
                        }
                    }
                })

                await axios.post('/data/truncate', hooks.writeRequestBodyWith('wrongCollectionId', []), authOwner)

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual(
                    expect.toIncludeSameMembers([data.pagingMetadata(0, 0)])
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
        describe('Write Operations', () => {
            each(testSupportedOperations(supportedOperations, 
            [
                ['insert', 'afterInsert', '/data/insert'],
                ['update', 'afterUpdate', '/data/update', { neededOperations: [UpdateImmediately] }],
                ['remove', 'afterRemove', '/data/remove', { neededOperations: [DeleteImmediately] }],
            ])).test('after %s request - should be able to modify response', async(operation, hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.afterAllColumn, ctx.afterWriteColumn, ctx.afterHookColumn], authOwner)
                if (operation !== 'insert') {
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        afterAll: (payload, requestContext: coreTypes.RequestContext, _serviceContext) => {
                            if (requestContext.operation !== DataOperation.query) {
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
                        afterWrite: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterWriteColumn.name]: true,
                                    [ctx.afterHookColumn.name]: false,
                                }))
                            }
                        },
                        [hookName]: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterHookColumn.name]: true,
                                }))
                            }
                        }
                    }
                })

                const response = await axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), { responseType: 'stream', ...authOwner })

                await expect(streamToArray(response.data)).resolves.toEqual(
                    expect.toIncludeSameMembers([{
                        item: {
                            ...ctx.item,
                            [ctx.afterAllColumn.name]: true,
                            [ctx.afterWriteColumn.name]: true,
                            [ctx.afterHookColumn.name]: true,
                        }
                    }]))
            })
        })
    })

    describe('Error Handling', () => {
        test('should handle error object and throw with the corresponding status', async() => {
            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        const error = new Error('message')
                        error['status'] = '409'
                        throw error
                    }
                }
            })

            await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith(409, 'message')
            )
        })

        test('If not specified should throw 500 - Error object', async() => {
            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        const error = new Error('message')
                        throw error
                    }
                }
            })

            await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith(500, 'message')
            )
        })

        test('If not specified should throw 500 - string', async() => {
            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        throw 'message'
                    }
                }
            })

            await expect(axios.post('/data/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith(500, 'message')
            )
        })
    })

    describe('Custom context, Service context', () => { //skip aggregate if needed!
        each(testSupportedOperations(supportedOperations,
        [ 
            ['query', 'Read', 'beforeQuery', 'afterQuery', '/data/query'],
            ['count', 'Read', 'beforeCount', 'afterCount', '/data/count'],
            ['insert', 'Write', 'beforeInsert', 'afterInsert', '/data/insert'],
            ['update', 'Write', 'beforeUpdate', 'afterUpdate', '/data/update', { neededOperations: [UpdateImmediately] }],
            ['remove', 'Write', 'beforeRemove', 'afterRemove', '/data/remove', { neededOperations: [DeleteImmediately] }],
            ['truncate', 'Write', 'beforeTruncate', 'afterTruncate', '/data/truncate'],
        ])).test('%s - should be able to modify custom context from each hook, and use service context', async(operation, operationType, beforeHook, afterHook, api) => {
            await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
            if (operation !== 'insert') {
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)
            }

            const beforeOperationHookName = `before${operationType}`
            const afterOperationHookName = `after${operationType}`

            env.externalDbRouter.reloadHooks({
                dataHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext, customContext) => {
                        customContext['beforeAll'] = true
                    },
                    [beforeOperationHookName]: (_payload, _requestContext, _serviceContext, customContext) => {
                        customContext['beforeOperation'] = true
                    },
                    [beforeHook]: (_payload, _requestContext, _serviceContext, customContext) => {
                        customContext['beforeHook'] = true
                    },
                    afterAll: (_payload, _requestContext, _serviceContext, customContext) => {
                        customContext['afterAll'] = true
                    },
                    [afterOperationHookName]: (_payload, _requestContext, _serviceContext, customContext) => {
                        customContext['afterOperation'] = true
                    },
                    [afterHook]: async(payload, _requestContext, serviceContext: coreTypes.ServiceContext, customContext) => {
                        customContext['afterHook'] = true

                            if (customContext['beforeAll'] && customContext['beforeOperation'] &&
                                customContext['beforeHook'] && customContext['afterAll'] &&
                                customContext['afterOperation'] && customContext['afterHook']) {

                                await serviceContext.schemaService.create(ctx.newCollection)
                                await serviceContext.dataService.insert(ctx.newCollection.id, ctx.newItem)
                            }
                    }
                }
            })

            await axios.post(api, hooks.requestBodyWith(ctx.collectionName, [ctx.item]), { responseType: 'stream', ...authOwner })

            hooks.resetHooks(env.externalDbRouter)

            await expect(data.queryCollectionAsArray(ctx.newCollection.id, [], undefined, authOwner)).resolves.toEqual(
                expect.toIncludeSameMembers([{ item: ctx.newItem }, data.pagingMetadata(1, 1)]))
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
        newCollection: collectionSpi.Collection
        newItem: ItemWithId
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
        newCollection: Uninitialized,
        newItem: Uninitialized
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.newCollection = gen.randomCollection()
        ctx.column = gen.randomColumn()
        ctx.afterAllColumn = { name: 'afterAll', type: 'boolean' }
        ctx.afterWriteColumn = { name: 'afterWrite', type: 'boolean' }
        ctx.afterReadColumn = { name: 'afterRead', type: 'boolean' }
        ctx.afterHookColumn = { name: 'afterHook', type: 'boolean' }
        ctx.item = genCommon.randomEntity([ctx.column.name]) as ItemWithId
        ctx.items = Array.from({ length: 10 }, () => genCommon.randomEntity([ctx.column.name])) as ItemWithId[]

        ctx.newItem = genCommon.randomEntity([]) as ItemWithId
        ctx.numberColumns = gen.randomNumberColumns()
        ctx.numberItem = genCommon.randomNumberEntity(ctx.numberColumns) as ItemWithId
        ctx.anotherNumberItem = genCommon.randomNumberEntity(ctx.numberColumns) as ItemWithId

        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
