const { authOwner, errorResponseWith } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } = require('../resources/e2e_resources')
const gen = require('../gen')
const matchers = require('../drivers/schema_api_rest_matchers')
const schema = require('../drivers/schema_api_rest_test_support')
const hooks = require('../drivers/hooks_test_support')

const { Uninitialized } = require('test-commons')

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
            each([
                ['afterCreate', '/schemas/create'],
                ['afterColumnAdd', '/schemas/column/add'],
                ['afterColumnRemove', '/schemas/column/remove']
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
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
            ]).test('specific hook %s should overwrite non-specific and change payload', async(hookName, api) => {
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
                .test('Before create collection %s hook should change payload', async(hookName) => {
                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (_collectionName, requestContext, _serviceContext) => {
                                if (requestContext.operation === 'create')
                                    return ctx.anotherCollectionName
                            }
                        }
                    })

                    await axios.post('/schemas/create', { collectionName: ctx.collectionName }, authOwner)

                    await expect(schema.retrieveSchemaFor(ctx.anotherCollectionName, authOwner)).resolves.toEqual(matchers.collectionResponseWithDefaultFieldsFor(ctx.anotherCollectionName))
                })

            each(['beforeAll', 'beforeWrite', 'beforeColumnAdd'])
                .test('Before add column %s hook should change payload', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [], authOwner)

                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (_column, requestContext, _serviceContext) => {
                                if (requestContext.operation === 'columnAdd')
                                    return ctx.anotherColumn
                            }
                        }
                    })

                    await axios.post('/schemas/column/add', { collectionName: ctx.collectionName, column: ctx.column }, authOwner)

                    await expect(schema.retrieveSchemaFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.collectionResponseHasField(ctx.anotherColumn))
                })

            each(['beforeAll', 'beforeWrite', 'beforeColumnRemove'])
                .test('Before remove column %s hook should change payload', async(hookName) => {
                    await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (columnName, _requestContext, _serviceContext) => {
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
                .test('Before find collection %s hook should change payload', async(hookName) => {
                    await schema.givenCollection(ctx.anotherCollectionName, [], authOwner)
                    env.externalDbRouter.reloadHooks({
                        schemaHooks: {
                            [hookName]: (_collectionName, requestContext, _serviceContext) => {
                                if (requestContext.operation === 'find')
                                    return [ctx.anotherCollectionName]
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
            ]).test('before %s operation, %s hook should be able to create collection', async(operation, hookName, api) => {
                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        [hookName]: async(_payload, requestContext, serviceContext) => {
                            if (requestContext.operation === operation)
                                await serviceContext.schemaService.create(ctx.collectionName)
                        }
                    }
                })

                await expect(axios.post(api, {}, authOwner)).resolves.toEqual(matchers.listResponseWithCollection(ctx.collectionName))
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
