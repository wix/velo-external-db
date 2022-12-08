import Chance = require('chance')
import { Uninitialized } from '@wix-velo/test-commons'
import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } from '../resources/e2e_resources'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as matchers from '../drivers/index_api_rest_matchers'
import * as index from '../drivers/index_api_rest_test_support'
import * as gen from '../gen'
import axios from 'axios'
const chance = new Chance()
import { eventually } from '../utils/eventually'

const axiosServer = axios.create({
    baseURL: 'http://localhost:8080'
})


describe(`Velo External DB Index API: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()
        await initApp()
    })

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    test('list', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWithDefaultIndex())
    })

    test('list with multiple indexes', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWith([ctx.index]))
    })

    test('create', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        // in-progress
        await expect(axiosServer.post('/indexes/create', {
            dataCollectionId: ctx.collectionName,
            index: ctx.index
        }, authOwner)).resolves.toEqual(matchers.createIndexResponseWith(ctx.index))

        // active
        await eventually(async() =>
            await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWith([ctx.index]))
        )
    })

    test('create with existing index', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await expect(axiosServer.post('/indexes/create', {
            dataCollectionId: ctx.collectionName,
            index: ctx.index
        }, authOwner)).rejects.toThrow()
    })

    test('remove', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await expect(axiosServer.post('/indexes/remove', {
            dataCollectionId: ctx.collectionName,
            indexName: ctx.index.name
        }, authOwner)).resolves.toEqual(matchers.removeIndexResponse()).catch()

        await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.not.toEqual(matchers.listIndexResponseWith([ctx.index]))
    })


    test('get failed indexes', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        
        await axiosServer.post('/indexes/create', {
            dataCollectionId: ctx.collectionName,
            index: ctx.invalidIndex
        }, authOwner).catch(_e => {})
        

        await eventually(async() =>
            await expect(index.retrieveIndexesFor(ctx.collectionName, authOwner)).resolves.toEqual(matchers.listIndexResponseWithFailedIndex(ctx.invalidIndex))
        )
    })

    afterAll(async() => {
        await teardownApp()
    })

    const ctx = {
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
