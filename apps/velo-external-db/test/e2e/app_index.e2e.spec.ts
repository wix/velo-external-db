import Chance = require('chance')
import { Uninitialized, testIfSupportedOperationsIncludes } from '@wix-velo/test-commons'
import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, supportedOperations } from '../resources/e2e_resources'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as matchers from '../drivers/index_api_rest_matchers'
import * as index from '../drivers/index_api_rest_test_support'
import * as gen from '../gen'
import axios from 'axios'
const chance = new Chance()
import { eventually } from '../utils/eventually'
import { InputField, SchemaOperations } from '@wix-velo/velo-external-db-types'
import { indexSpi } from '@wix-velo/velo-external-db-core'

const { Indexing } = SchemaOperations

const axiosServer = axios.create({
    baseURL: 'http://localhost:8080/v3'
})


describe(`Velo External DB Index API: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()
        await initApp()
    })

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    testIfSupportedOperationsIncludes(supportedOperations, [Indexing])('list', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWithDefaultIndex())
    })

    testIfSupportedOperationsIncludes(supportedOperations, [Indexing])('list with multiple indexes', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWith([ctx.index]))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [Indexing])('create', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        // in-progress
        await expect(index.createIndexFor(ctx.collectionName, ctx.index, authOwner)).resolves.toEqual(matchers.createIndexResponseWith(ctx.index))

        // active
        await eventually(async() =>
            await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWith([ctx.index]))
        )
    })

    testIfSupportedOperationsIncludes(supportedOperations, [Indexing])('create an index on a column that already has an existing index, should return the index with status failed', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await eventually(async() => await expect(axiosServer.post('/indexes/create', {
            dataCollectionId: ctx.collectionName,
            index: ctx.index
        }, authOwner).then(res => res.data)).resolves.toEqual(matchers.failedIndexCreationResponse(ctx.index)
    ))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [Indexing])('creation of index with invalid column should return the index with status failed', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        await eventually(async() => await expect(index.createIndexFor(ctx.collectionName, ctx.invalidIndex, authOwner)).resolves.toEqual(matchers.failedIndexCreationResponse(ctx.invalidIndex)))
    })

    testIfSupportedOperationsIncludes(supportedOperations, [Indexing])('remove', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await expect( index.removeIndexFor(ctx.collectionName, ctx.index.name, authOwner)).resolves.toEqual(matchers.removeIndexResponse())
            
        await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.not.toEqual(matchers.listIndexResponseWith([ctx.index]))
    })

    afterAll(async() => {
        await teardownApp()
    })

    interface Ctx {
        collectionName: string
        column: InputField
        index: indexSpi.Index
        invalidIndex: indexSpi.Index
    }

    const ctx: Ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        index: Uninitialized,
        invalidIndex: Uninitialized,
    }

    beforeEach(() => {
        ctx.collectionName = chance.word()
        ctx.column = gen.randomColumn()
        ctx.index = gen.spiIndexFor(ctx.collectionName, [ctx.column.name])
        ctx.invalidIndex = gen.spiIndexFor(ctx.collectionName, ['wrongColumn'])
    })
})
