/* eslint-disable @typescript-eslint/no-unused-vars */
import { authOwner, errorResponseWith } from '@wix-velo/external-db-testkit'
import { testIfSupportedOperationsIncludes, testSupportedOperations } from '@wix-velo/test-commons'
import { dataSpi, types as coreTypes, collectionSpi, dataConvertUtils } from '@wix-velo/velo-external-db-core'
import { DataOperation, InputField, Item, ItemWithId, SchemaOperations } from '@wix-velo/velo-external-db-types'
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
    baseURL: 'http://localhost:8080/v3'
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

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner, { _id: { $ne: ctx.item._id } })).resolves.toEqual({
                    items: expect.toIncludeSameMembers([ctx.item]),
                    pagingMetadata: data.pagingMetadata(1, 1)
                })
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

                await expect(axios.post('/items/count', data.countRequest(ctx.collectionName, { _id: { $ne: ctx.item._id } }), authOwner)).resolves.toEqual(
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
                                    aggregation: { ...payload.aggregation, groupingFields: [] },
                                    initialFilter: { _id: { $eq: ctx.numberItem._id } },
                                }
                            },
                            beforeRead: (payload: dataSpi.AggregateRequest, _requestContext, _serviceContext): dataSpi.AggregateRequest => {
                                return {
                                    ...payload,
                                    aggregation: { ...payload.aggregation, groupingFields: ['_id'] },
                                    finalFilter: { myAvg: { $gt: 0 } },
                                }
                            },
                            beforeAggregate: (payload: dataSpi.AggregateRequest, _requestContext, _serviceContext): dataSpi.AggregateRequest => {
                                return {
                                    ...payload,
                                    aggregation: { ...payload.aggregation, groupingFields: ['_id', '_owner'] },
                                }
                            }
                        }
                    })

                    const response = await axios.post('/items/aggregate',
                        {
                            collectionId: ctx.collectionName,
                            initialFilter: { _id: { $ne: ctx.numberItem._id } },
                            aggregation: {
                                groupingFields: ['_id'], 
                                operations: [
                                    {
                                        resultFieldName: 'myAvg',
                                        average: { itemFieldName: ctx.numberColumns[0].name }
                                    },
                                    {
                                        resultFieldName: 'mySum',
                                        sum: { itemFieldName: ctx.numberColumns[1].name }
                                    }
                                ]
                            },
                            finalFilter: { myAvg: { $lt: 0 } },
                            returnTotalCount: true
                        }, authOwner )


                    expect(response.data).toEqual({
                        items: [{
                            _id: ctx.numberItem._id,
                            _owner: ctx.numberItem._owner,
                            myAvg: ctx.numberItem[ctx.numberColumns[0].name],
                            mySum: ctx.numberItem[ctx.numberColumns[1].name]
                        }],
                        pagingMetadata: data.pagingMetadata(1, 1)
                    })

                })


            }
            
            
        })
        
        describe('Write Operations', () => {
            each(testSupportedOperations(supportedOperations, 
                [
                    ['insert', 'beforeInsert', '/items/insert'],
                    ['update', 'beforeUpdate', '/items/update', { neededOperations: [UpdateImmediately] }],
                ]
                )).test('before %s request - should be able to modify the item', async(operation, hookName, api) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.afterAllColumn, ctx.afterWriteColumn, ctx.afterHookColumn], authOwner)
                    if (operation !== 'insert') {
                        await data.givenItems([ctx.item], ctx.collectionName, authOwner)
                    }

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            beforeAll: (payload: dataSpi.InsertRequest | dataSpi.UpdateRequest, requestContext: coreTypes.RequestContext, _serviceContext) => {
                                if (requestContext.operation !== DataOperation.query) {
                                    return {
                                        ...payload, items: payload.items.map( item => ({
                                            ...item,
                                            [ctx.afterAllColumn.name]: true,
                                            [ctx.afterWriteColumn.name]: false,
                                            [ctx.afterHookColumn.name]: false,
                                        }))
                                    }
                                }
                            },
                            beforeWrite: (payload: dataSpi.InsertRequest | dataSpi.UpdateRequest, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterWriteColumn.name]: true,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            },
                            [hookName]: (payload: dataSpi.InsertRequest | dataSpi.UpdateRequest, _requestContext, _serviceContext) => {
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

                    await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
                        items: expect.toIncludeSameMembers([{ 
                            ...ctx.item,
                            [ctx.afterAllColumn.name]: true,
                            [ctx.afterWriteColumn.name]: true,
                            [ctx.afterHookColumn.name]: true,
                        }]),
                        pagingMetadata: data.pagingMetadata(1, 1)
                    })
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

                await axios.post('/items/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.numberItem]), authOwner)

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
                    items: [],
                    pagingMetadata: data.pagingMetadata(0, 0)
                })
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

                await axios.post('/items/truncate', hooks.writeRequestBodyWith('wrongCollectionId', []), authOwner)

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
                    items: [],
                    pagingMetadata: data.pagingMetadata(0, 0)
                })
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
                        afterAll: (payload: coreTypes.QueryResponse, _requestContext, _serviceContext) => {
                            return {
                                ...payload, items: payload.items.map(item => ({
                                    ...item,
                                    [ctx.afterAllColumn.name]: true,
                                    [ctx.afterReadColumn.name]: false,
                                    [ctx.afterHookColumn.name]: false,
                                }))
                            }
                        },
                        afterRead: (payload: coreTypes.QueryResponse, _requestContext, _serviceContext) => {
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

                await expect(data.queryCollectionAsArray(ctx.collectionName, [], undefined, authOwner)).resolves.toEqual({
                    items: [{
                        ...ctx.item,
                        [ctx.afterAllColumn.name]: true,
                        [ctx.afterHookColumn.name]: true,
                        [ctx.afterReadColumn.name]: true,
                    }],
                    pagingMetadata: data.pagingMetadata(1, 1)
                })
            })

            test('after count request - should be able to modify count response', async() => {
                await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                await data.givenItems([ctx.item], ctx.collectionName, authOwner)

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        afterAll: (payload: coreTypes.CountResponse, _requestContext, _serviceContext) => {
                            return { ...payload, totalCount: payload.totalCount + 2 }
                        },
                        afterRead: (payload: coreTypes.CountResponse, _requestContext, _serviceContext) => {
                            return { ...payload, totalCount: payload.totalCount * 2 }
                        },
                        afterCount: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, totalCount: payload.totalCount - 3 }
                        }
                    }
                })

                await expect(axios.post('/items/count', data.countRequest(ctx.collectionName), authOwner)).resolves.toEqual(
                    matchers.responseWith({ totalCount: 3 }))
            })

            if (supportedOperations.includes(Aggregate)) {
                test('after aggregate request - should be able to modify response', async() => {
                    await schema.givenCollection(ctx.collectionName, [ctx.afterAllColumn, ctx.afterReadColumn, ctx.afterHookColumn], authOwner)
                    await data.givenItems([{ ...ctx.item, [ctx.afterAllColumn.name]: false, [ctx.afterReadColumn.name]: false, [ctx.afterHookColumn.name]: false }],
                        ctx.collectionName, authOwner)

                    env.externalDbRouter.reloadHooks({
                        dataHooks: {
                            afterAll: (payload: coreTypes.AggregateResponse, _requestContext, _serviceContext) => {
                                return {
                                    ...payload, items: payload.items.map(item => ({
                                        ...item,
                                        [ctx.afterAllColumn.name]: true,
                                        [ctx.afterReadColumn.name]: false,
                                        [ctx.afterHookColumn.name]: false,
                                    }))
                                }
                            },
                            afterRead: (payload: coreTypes.AggregateResponse, _requestContext, _serviceContext) => {
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

                    const response = await axios.post('/items/aggregate',
                        {
                            collectionId: ctx.collectionName,
                            initialFilter: { _id: { $eq: ctx.item._id } },
                            aggregation: {
                                groupingFields: [ctx.afterAllColumn.name, ctx.afterReadColumn.name, ctx.afterHookColumn.name],
                                operations: []
                            },
                            finalFilter: {},
                            returnTotalCount: true
                        }, authOwner)

                    expect((response.data)).toEqual({
                        items: [{
                            _id: expect.any(String),
                            [ctx.afterAllColumn.name]: true,
                            [ctx.afterHookColumn.name]: true,
                            [ctx.afterReadColumn.name]: true,
                        }],
                        pagingMetadata: data.pagingMetadata(1, 1)
                    })

                })

            }
        

        })
    
        describe('Write Operations', () => {
            each(testSupportedOperations(supportedOperations, 
            [
                ['insert', 'afterInsert', '/items/insert'],
                ['update', 'afterUpdate', '/items/update', { neededOperations: [UpdateImmediately] }],
                ['remove', 'afterRemove', '/items/remove', { neededOperations: [DeleteImmediately] }],
            ])).test('after %s request - should be able to modify response', async(operation, hookName, api) => {
                await schema.givenCollection(ctx.collectionName, [ctx.column, ctx.afterAllColumn, ctx.afterWriteColumn, ctx.afterHookColumn], authOwner)
                if (operation !== 'insert') {
                    await data.givenItems([ctx.item], ctx.collectionName, authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    dataHooks: {
                        afterAll: (payload: coreTypes.InsertResponse | coreTypes.UpdateResponse | coreTypes.RemoveResponse, requestContext: coreTypes.RequestContext, _serviceContext) => {
                            if (requestContext.operation !== DataOperation.query) {
                                return {
                                    ...payload, results: payload.results.map(({ item }: { item: Item }) => ({
                                        item: {
                                            ...item,
                                            [ctx.afterAllColumn.name]: true,
                                            [ctx.afterWriteColumn.name]: false,
                                            [ctx.afterHookColumn.name]: false,
                                        }
                                    }))
                                }
                            }
                        },
                        afterWrite: (payload: coreTypes.InsertResponse | coreTypes.UpdateResponse | coreTypes.RemoveResponse, _requestContext, _serviceContext) => {
                            return {
                                ...payload, results: payload.results.map(({ item }: { item: Item }) => ({
                                    item: {
                                        ...item,
                                        [ctx.afterWriteColumn.name]: true,
                                        [ctx.afterHookColumn.name]: false,
                                    }
                                }))
                            }
                        },
                        [hookName]: (payload, _requestContext, _serviceContext) => {
                            return {
                                ...payload, results: payload.results.map(({ item }: { item: Item }) => ({
                                    item: {
                                        ...item,
                                        [ctx.afterHookColumn.name]: true,
                                    }
                                }))
                            }
                        }
                    }
                })

                const response = await axios.post(api, hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner )

                await expect(response.data).toEqual({
                    results: [{
                        item: { 
                            ...ctx.item, 
                            [ctx.afterAllColumn.name]: true, 
                            [ctx.afterWriteColumn.name]: true, 
                            [ctx.afterHookColumn.name]: true, 
                        }
                    }]
                })
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

            await expect(axios.post('/items/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith('UNKNOWN_ERROR', 'message', 409)
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

            await expect(axios.post('/items/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith('UNKNOWN_ERROR', 'message', 500)
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

            await expect(axios.post('/items/remove', hooks.writeRequestBodyWith(ctx.collectionName, [ctx.item]), authOwner)).rejects.toMatchObject(
                errorResponseWith('UNKNOWN_ERROR', 'message', 500)
            )
        })
    })

    describe('Custom context, Service context', () => { //skip aggregate if needed!
        each(testSupportedOperations(supportedOperations,
        [ 
            ['query', 'Read', 'beforeQuery', 'afterQuery', '/items/query'],
            ['count', 'Read', 'beforeCount', 'afterCount', '/items/count'],
            ['insert', 'Write', 'beforeInsert', 'afterInsert', '/items/insert'],
            ['update', 'Write', 'beforeUpdate', 'afterUpdate', '/items/update', { neededOperations: [UpdateImmediately] }],
            ['remove', 'Write', 'beforeRemove', 'afterRemove', '/items/remove', { neededOperations: [DeleteImmediately] }],
            ['truncate', 'Write', 'beforeTruncate', 'afterTruncate', '/items/truncate'],
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

            await axios.post(api, hooks.requestBodyWith(ctx.collectionName, [ctx.item]), authOwner)

            hooks.resetHooks(env.externalDbRouter)

            await expect(data.queryCollectionAsArray(ctx.newCollection.id, [], undefined, authOwner)).resolves.toEqual({
                items: [ctx.newItem],
                pagingMetadata: data.pagingMetadata(1, 1)
            })
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
