import axios from 'axios'
import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { authOwner } from '@wix-velo/external-db-testkit'
import { collectionSpi } from '@wix-velo/velo-external-db-core'
// import { SchemaOperations } from '@wix-velo/velo-external-db-types'
// const each = require('jest-each').default
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } from '../resources/e2e_resources'
import { schemaUtils } from '@wix-velo/velo-external-db-core'
import gen = require('../gen')
import matchers = require('../drivers/schema_api_rest_matchers')
import schema = require('../drivers/schema_api_rest_test_support')
import hooks = require('../drivers/hooks_test_support_v3')
// const { RemoveColumn } = SchemaOperations


import { Uninitialized } from '@wix-velo/test-commons'
import { CollectionOperationSPI } from '@wix-velo/velo-external-db-types'

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
            test('before get collections request - should be able to modify the request, specific hooks should override non-specific', async() => {
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
            test('before create collection request - should be able to modify the request, specific hooks should override non-specific', async() => {
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
                await axiosClient.post('/collections/create', { collection: { id: 'wrong', fields: [] } }, { ...authOwner, responseType: 'stream' })

                await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionId, [...SystemFields], env.capabilities))
            })

            test('before update collection request - should be able to modify the request, specific hooks should override non-specific', async() => {
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
                const collection = await schema.retrieveSchemaFor(ctx.collectionId, authOwner)

                const collectionToUpdate = { ...collection, fields: [...collection.fields, schemaUtils.InputFieldToWixFormatField({ ...ctx.column, name: 'wrong' })] }

                await axiosClient.post('/collections/update', { collection: collectionToUpdate }, { ...authOwner, responseType: 'stream' })
                await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).resolves.toEqual(matchers.createCollectionResponseWith(ctx.collectionId, [...SystemFields, ctx.column], env.capabilities))
            })
        })
    })

    describe('After Hooks', () => {
        describe('Read operations', () => {
            test('after get collections request - should be able to modify the response, specific hooks should override non-specific', async() => {
                await schema.givenCollection(ctx.collectionId, [], authOwner)

                // await expect(schema.retrieveSchemaFor(ctx.collectionId, authOwner)).resolves.toEqual(matchers.collectionResponsesWith('otherName', [...SystemFields], env.capabilities))
            })
        })
    })


    const ctx = {
        collectionId: Uninitialized,
        anotherCollectionName: Uninitialized,
        column: Uninitialized,
        anotherColumn: Uninitialized
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
