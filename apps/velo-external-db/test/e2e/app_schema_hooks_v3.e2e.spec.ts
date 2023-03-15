import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { authOwner } from '@wix-velo/external-db-testkit'
import { collectionSpi } from '@wix-velo/velo-external-db-core'
// import { SchemaOperations } from '@wix-velo/velo-external-db-types'
// const each = require('jest-each').default
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } from '../resources/e2e_resources'
import gen = require('../gen')
import matchers = require('../drivers/schema_api_rest_matchers')
import schema = require('../drivers/schema_api_rest_test_support')
import hooks = require('../drivers/hooks_test_support_v3')
// const { RemoveColumn } = SchemaOperations


import { Uninitialized } from '@wix-velo/test-commons'




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
