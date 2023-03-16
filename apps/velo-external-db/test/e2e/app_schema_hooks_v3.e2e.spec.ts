import axios from 'axios'
import each from 'jest-each'
import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { authOwner } from '@wix-velo/external-db-testkit'
import { collectionSpi } from '@wix-velo/velo-external-db-core'
import { Uninitialized } from '@wix-velo/test-commons'
import { CollectionOperationSPI } from '@wix-velo/velo-external-db-types'
import { schemaUtils } from '@wix-velo/velo-external-db-core'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } from '../resources/e2e_resources'
import gen = require('../gen')
import matchers = require('../drivers/schema_api_rest_matchers')
import schema = require('../drivers/schema_api_rest_test_support')
import hooks = require('../drivers/hooks_test_support_v3')

const axiosClient = axios.create({
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

    describe('Before Hooks', () => {
        describe('Read operations', () => {
            test('before get collections request - should be able to modify the request (collectionIds)', async() => {
                await schema.givenCollection(ctx.collectionId, [], authOwner)

                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.collectionId)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        beforeAll: (payload: collectionSpi.ListCollectionsRequest, _requestContext, _serviceContext) => {
                            return { ...payload, collectionIds: [idPart1] }
                        },
                        beforeRead: (payload: collectionSpi.ListCollectionsRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, collectionIds: [payload.collectionIds[0].concat(idPart2)]
                            }
                        },
                        beforeGet: (payload: collectionSpi.ListCollectionsRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, collectionIds: [payload.collectionIds[0].concat(idPart3)]
                            }
                        }
                    }
                })

                await expect(schema.retrieveSchemaFor('wrong', authOwner)).resolves.toEqual(matchers.collectionResponsesWith(ctx.collectionId, [...SystemFields], env.capabilities))
            })
        })
        describe('Write operations', () => {
            test('before create collection request - should be able to modify the request (collection)', async() => {
                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.collectionId)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        beforeAll: (payload: collectionSpi.CreateCollectionRequest, _requestContext, _serviceContext) => {
                            if (_requestContext.operation !== CollectionOperationSPI.Get) {
                                return { collection: { ...payload.collection, id: idPart1 } }
                            }
                        },
                        beforeWrite: (payload: collectionSpi.CreateCollectionRequest, _requestContext, _serviceContext) => {
                            return { ...hooks.concatToProperty(payload, 'collection.id', idPart2) }
                        },

                        beforeCreate: (payload: collectionSpi.CreateCollectionRequest, _requestContext, _serviceContext) => {
                            return { ...hooks.concatToProperty(payload, 'collection.id', idPart3) }
                        }
                    }
                })
                await axiosClient.post('/collections/create', { collection: { id: 'wrong', fields: [] } }, authOwner)

                await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionId, [...SystemFields], env.capabilities))
            })

            test('before update collection request - should be able to modify the request (collection)', async() => {
                await schema.givenCollection(ctx.collectionId, [], authOwner)

                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.column.name)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        beforeAll: (payload: collectionSpi.UpdateCollectionRequest, _requestContext, _serviceContext) => {
                            if (_requestContext.operation !== CollectionOperationSPI.Get) {
                                return {
                                    ...payload, collection: {
                                        ...payload.collection, fields: payload.collection.fields.map((field) => {
                                            if (!SystemFields.map(f => f.name).includes(field.key)) {
                                                return { ...field, key: idPart1 }
                                            }
                                            return field
                                        })
                                    }
                                }
                            }
                        },
                        beforeWrite: (payload: collectionSpi.UpdateCollectionRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, collection: {
                                    ...payload.collection, fields: payload.collection.fields.map((field) => {
                                        if (!SystemFields.map(f => f.name).includes(field.key)) {
                                            return { ...field, key: field.key.concat(idPart2) }
                                        }
                                        return field
                                    })
                                }
                            }
                        },
                        beforeUpdate: (payload: collectionSpi.UpdateCollectionRequest, _requestContext, _serviceContext) => {
                            return {
                                ...payload, collection: {
                                    ...payload.collection, fields: payload.collection.fields.map((field) => {
                                        if (!SystemFields.map(f => f.name).includes(field.key)) {
                                            return { ...field, key: field.key.concat(idPart3) }
                                        }
                                        return field
                                    })
                                }
                            }
                        }
                    }
                })
                const { collection } = await schema.retrieveSchemaFor(ctx.collectionId, authOwner)
                
                const collectionToUpdate = { ...collection, fields: [...collection.fields, schemaUtils.InputFieldToWixFormatField({ ...ctx.column, name: 'wrong' })] }
                
                await axiosClient.post('/collections/update', { collection: collectionToUpdate }, authOwner)
                await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionId, [...SystemFields, ctx.column], env.capabilities))
            })

            test('before delete collection request - should be able to modify the request (collectionId)', async() => {
                await schema.givenCollection(ctx.collectionId, [], authOwner)

                const [idPart1, idPart2, idPart3] = hooks.splitIdToThreeParts(ctx.collectionId)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        beforeAll: (payload: collectionSpi.DeleteCollectionRequest, _requestContext, _serviceContext) => {
                            if (_requestContext.operation !== CollectionOperationSPI.Get) {
                                return { collectionId: idPart1 }
                            }
                        },
                        beforeWrite: (payload: collectionSpi.DeleteCollectionRequest, _requestContext, _serviceContext) => {
                            return { ...hooks.concatToProperty(payload, 'collectionId', idPart2) }
                        },
                        beforeDelete: (payload: collectionSpi.DeleteCollectionRequest, _requestContext, _serviceContext) => {
                            return { ...hooks.concatToProperty(payload, 'collectionId', idPart3) }
                        }
                    }
                })
                await axiosClient.post('/collections/delete', { collectionId: 'wrong' }, authOwner)

                await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).rejects.toThrow('404')
            })
        })
    })

    describe('After Hooks', () => {
        describe('Read operations', () => {
            test('after get collections request - should be able to modify the response', async() => {
                await schema.givenCollection(ctx.collectionId, [], authOwner)

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        afterAll: (payload: { collections: collectionSpi.Collection[] }, _requestContext, _serviceContext) => {
                            if (_requestContext.operation === CollectionOperationSPI.Get) {
                                return {
                                    collections: payload.collections.map((collection) => {
                                        return { ...collection, id: collection.id.concat('1') }
                                    })
                                }
                            }
                        },
                        afterRead: (payload: { collections: collectionSpi.Collection[] }, _requestContext, _serviceContext) => {
                            return {
                                collections: payload.collections.map((collection) => {
                                    return { ...collection, id: collection.id.concat('2') }
                                })
                            }
                        },
                        afterGet: (payload: { collections: collectionSpi.Collection[] }, _requestContext, _serviceContext) => {
                            return {
                                collections: payload.collections.map((collection) => {
                                    return { ...collection, id: collection.id.concat('3') }
                                })
                            }
                        }
                    }
                })

                await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(`${ctx.collectionId}123`, [...SystemFields], env.capabilities))
            })
        })
        describe('Write operations', () => {
            each([
                ['create', 'afterCreate', '/collections/create', []],
                ['update', 'afterUpdate', '/collections/update', SystemFields],
                ['delete', 'afterDelete', '/collections/delete', []]
            ]).test('after %s collection request - should be able to modify the response (collection)', async(operation, hookName, api, fields) => {
                if (operation !== 'create') {
                    await schema.givenCollection(ctx.collectionId, [], authOwner)
                }

                env.externalDbRouter.reloadHooks({
                    schemaHooks: {
                        afterAll: (payload: { collection: collectionSpi.Collection }, _requestContext, _serviceContext) => {
                            if (_requestContext.operation !== CollectionOperationSPI.Get) {
                                return {
                                    collection: {
                                        ...payload.collection, id: payload.collection.id.concat('1')
                                    }
                                }
                            }
                        },
                        afterWrite: (payload: { collection: collectionSpi.Collection }, _requestContext, _serviceContext) => {
                            return {
                                collection: {
                                    ...payload.collection, id: payload.collection.id.concat('2')
                                }
                            }
                        },
                        [hookName]: (payload: { collection: collectionSpi.Collection }, _requestContext, _serviceContext) => {
                            return {
                                collection: {
                                    ...payload.collection, id: payload.collection.id.concat('3')
                                }
                            }
                        }
                    }
                })

                const res = await axiosClient.post(api, hooks.collectionWriteRequestBodyWith({ id: ctx.collectionId, fields: fields.map(schemaUtils.InputFieldToWixFormatField) }), authOwner)
                expect(res.data.collection.id).toEqual(`${ctx.collectionId}123`)
            })
        })
    })



    const ctx = {
        collectionId: Uninitialized,
        anotherCollectionName: Uninitialized,
        column: Uninitialized,
        anotherColumn: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionId = gen.randomCollectionName()
        ctx.anotherCollectionName = gen.randomCollectionName()
        ctx.column = gen.randomColumn()
        ctx.anotherColumn = gen.randomColumn()
        hooks.resetHooks(env.externalDbRouter)
    })

    afterAll(async() => await teardownApp())
})
