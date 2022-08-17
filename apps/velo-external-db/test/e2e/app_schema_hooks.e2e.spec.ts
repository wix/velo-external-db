import { authOwner, errorResponseWith } from '@wix-velo/external-db-testkit'
import { testSupportedOperations } from '@wix-velo/test-commons'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
const each = require('jest-each').default
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env, supportedOperations } from '../resources/e2e_resources'
import gen = require('../gen')
import matchers = require('../drivers/schema_api_rest_matchers')
import schema = require('../drivers/schema_api_rest_test_support')
import hooks = require('../drivers/hooks_test_support')
const { RemoveColumn } = SchemaOperations

import { Uninitialized } from '@wix-velo/test-commons'

import { ServiceContext } from '@wix-velo/velo-external-db-core'

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB Schema Hooks: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()

        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    describe('After Hooks', () => {
        describe('Write operations', () => {
            each(testSupportedOperations(supportedOperations, [
                ['afterCreate', '/schemas/create'],
                ['afterColumnAdd', '/schemas/column/add'],
                ['afterColumnRemove', '/schemas/column/remove',  { neededOperations: [RemoveColumn] }]
            ])).test('specific hook %s should overwrite non-specific and change payload', async(hookName: string, api: string) => {
                if (!['afterCreate'].includes(hookName)) {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
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

                await expect(axios.post(api, hooks.writeSchemaRequestBodyWith(ctx.collectionName, ctx.column, ctx.anotherColumn), authOwner)).resolves.toEqual(
                    expect.objectContaining({ data: expect.objectContaining({ [hookName]: true, afterAll: true, afterWrite: true }) })
                )
            })
        })

        describe('Read operations', () => {
            each([
                ['afterFind', '/schemas/find'],
                ['afterList', '/schemas/list'],
                ['afterListHeaders', '/schemas/list/headers']
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName: string, api: string) => {
                await schema.givenCollection(ctx.collectionName, [], authOwner)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        afterAll: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: false, afterAll: true, afterRead: false }
                        }
                        , afterRead: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: false, afterRead: true }
                        }
                        , [hookName]: (payload, _requestContext, _serviceContext) => {
                            return { ...payload, [hookName]: true }
                        }
                    }
                })

                await expect(axios.post(api, hooks.readSchemaRequestBodyWith(ctx.collectionName), authOwner)).resolves.toEqual(
                    expect.objectContaining({ data: expect.objectContaining({ [hookName]: true, afterAll: true, afterRead: true }) })
                )
            })
        })
    })

    describe('Before hooks', () => {
        describe('Write operations', () => {
            each(['beforeAll', 'beforeWrite', 'beforeCreate'])
                .test('Before create collection %s hook should change payload', async(hookName: string) => {
                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (payload, requestContext, _serviceContext) => {
                                if (requestContext.operation === 'create')
                                    return { ...payload, collectionName: ctx.anotherCollectionName }
                            }
                        }
                    })

                    await axios.post('/schemas/create', { collectionName: ctx.collectionName }, authOwner)

                    await expect(schema.retrieveSchemaFor(ctx.anotherCollectionName, authOwner)).resolves.toEqual(matchers.collectionResponseWithDefaultFieldsFor(ctx.anotherCollectionName))
                })

            each(['beforeAll', 'beforeWrite', 'beforeColumnAdd'])
                .test('Before add column %s hook should change payload', async(hookName: string) => {
                    await schema.givenCollection(ctx.collectionName, [], authOwner)

                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (payload, requestContext, _serviceContext) => {
                                if (requestContext.operation === 'columnAdd')
                                    return { ...payload, column: ctx.anotherColumn }
                            }
                        }
                    })

                    await axios.post('/schemas/column/add', { collectionName: ctx.collectionName, column: ctx.column }, authOwner)

                    await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.collectionResponseHasField(ctx.anotherColumn))
                })

            each(['beforeAll', 'beforeWrite', 'beforeColumnRemove'])
                .test('Before remove column %s hook should change payload', async(hookName: string) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: ({ columnName }, _requestContext, _serviceContext) => {
                                if (columnName === ctx.column.name) {
                                    throw ('Should not be removed')
                                }
                            }
                        }
                    })

                    await expect(axios.post('/schemas/column/remove', { collectionName: ctx.collectionName, columnName: ctx.column.name }, authOwner)).rejects.toMatchObject(
                        errorResponseWith(400, 'Should not be removed')
                    )
                })
        })

        describe('Read operations', () => {
            each(['beforeAll', 'beforeRead', 'beforeFind'])
                .test('Before find collection %s hook should change payload', async(hookName: string) => {
                    await schema.givenCollection(ctx.anotherCollectionName, [], authOwner)
                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (payload, requestContext, _serviceContext) => {
                                if (requestContext.operation === 'find')
                                    return { ...payload, schemaIds: [ctx.anotherCollectionName] }
                            }
                        }
                    })

                    await expect(axios.post('/schemas/find', { schemaIds: [ctx.collectionName] }, authOwner)).resolves.toEqual(matchers.collectionResponseWithDefaultFieldsFor(ctx.anotherCollectionName))
                })

            each([
                ['list', 'beforeAll', '/schemas/list'],
                ['list', 'beforeRead', '/schemas/list'],
                ['list', 'beforeList', '/schemas/list'],
                ['listHeaders', 'beforeAll', '/schemas/list/headers'],
                ['listHeaders', 'beforeRead', '/schemas/list/headers'],
                ['listHeaders', 'beforeListHeaders', '/schemas/list/headers']
            ]).test('before %s operation, %s hook should be able to create collection', async(operation: any, hookName: string, api: string) => {
                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        [hookName]: async(_payload, requestContext, serviceContext: ServiceContext) => {
                            if (requestContext.operation === operation)
                                await serviceContext.schemaService.create(ctx.collectionName)
                        }
                    }
                })

                await expect(axios.post(api, {}, authOwner)).resolves.toEqual(matchers.listResponseWithCollection(ctx.collectionName))
            })
        })
    })

    describe('Error Handling', () => {
        test('should handle error object and throw with the corresponding status', async() => {
            env.externalDbRouter.reloadHooks({
                schemaHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        const error = new Error('message')
                        error['status'] = '409'
                        throw error                    
                    }
                }
            })

            await expect(axios.post('/schemas/create', { collectionName: ctx.collectionName }, authOwner)).rejects.toMatchObject(
                errorResponseWith(409, 'message')
            )
        })
        
        test('If not specified should throw 400 - Error object', async() => {
            env.externalDbRouter.reloadHooks({
                schemaHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        const error = new Error('message')
                        throw error                    
                    }
                }
            })

            await expect(axios.post('/schemas/create', { collectionName: ctx.collectionName }, authOwner)).rejects.toMatchObject(
                errorResponseWith(400, 'message')
            )
        })

        test('If not specified should throw 400 - string', async() => { 
            env.externalDbRouter.reloadHooks({
                schemaHooks: {
                    beforeAll: (_payload, _requestContext, _serviceContext) => {
                        throw 'message'                    
                    }
                }
            })

            await expect(axios.post('/schemas/create', { collectionName: ctx.collectionName }, authOwner)).rejects.toMatchObject(
                errorResponseWith(400, 'message')
            )
        })
    })

    describe('Custom Context', () => {
        describe ('Read Operations', () => {
            each([
               ['List', 'beforeList', 'afterList', '/schemas/list'],
                ['ListHeaders', 'beforeListHeaders', 'afterListHeaders', '/schemas/list/headers'],
                ['Find', 'beforeFind', 'afterFind', '/schemas/find']
            ]).test('customContext should pass by ref on [%s]', async(_: any, beforeHook: string, afterHook: string | number, api: string) => {
                await schema.givenCollection(ctx.collectionName, [], authOwner)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        beforeAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['beforeAll'] = true
                        },
                        beforeRead: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['beforeRead'] = true
                        },
                        [beforeHook]: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext[beforeHook] = true
                        },
                        afterAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['afterAll'] = true
                        },
                        afterRead: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['afterRead'] = true
                        },
                        [afterHook]: (payload, _requestContext, _serviceContext, customContext) => {
                            customContext[afterHook] = true
                            return { ...payload, customContext }
                        }
                    }
                })

                const response = await axios.post(api, hooks.readSchemaRequestBodyWith(ctx.collectionName), authOwner)
                expect(response.data.customContext).toEqual({
                    beforeAll: true, beforeRead: true, [beforeHook]: true, afterAll: true, afterRead: true, [afterHook]: true
                })
            })
        })

        describe ('Write Operations', () => {
            each(testSupportedOperations(supportedOperations, [
                ['Create', 'beforeCreate', 'afterCreate', '/schemas/create'],
                ['Column Add', 'beforeColumnAdd', 'afterColumnAdd', '/schemas/column/add'],
                ['Column Remove', 'beforeColumnRemove', 'afterColumnRemove', '/schemas/column/remove', { neededOperations: [RemoveColumn] }],
            ])).test('customContext should pass by ref on [%s]', async(operation: string, beforeHook: string | number, afterHook: string | number, api: string) => {
                if (operation !== 'Create') {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        beforeAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['beforeAll'] = true
                        },
                        beforeWrite: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['beforeRead'] = true
                        },
                        [beforeHook]: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext[beforeHook] = true
                        },
                        afterAll: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['afterAll'] = true
                        },
                        afterWrite: (_payload, _requestContext, _serviceContext, customContext) => {
                            customContext['afterRead'] = true
                        },
                        [afterHook]: (payload, _requestContext, _serviceContext, customContext) => {
                            customContext[afterHook] = true
                            return { ...payload, customContext }
                        }
                    }
                })

                const response = await axios.post(api, hooks.writeSchemaRequestBodyWith(ctx.collectionName, ctx.column, ctx.anotherColumn), authOwner)
                expect(response.data.customContext).toEqual({
                    beforeAll: true, beforeRead: true, [beforeHook]: true, afterAll: true, afterRead: true, [afterHook]: true
                })      
            })
        })
    })

    const ctx = {
        collectionName: Uninitialized,
        anotherCollectionName: Uninitialized,
        column: Uninitialized,
        anotherColumn: Uninitialized
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
        ctx.anotherCollectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.anotherColumn = gen.randomColumn()

        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
