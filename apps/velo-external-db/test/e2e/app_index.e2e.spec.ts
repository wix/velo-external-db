import Chance = require('chance')
import { Uninitialized } from '@wix-velo/test-commons';
import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } from '../resources/e2e_resources'
import * as schema from '../drivers/schema_api_rest_test_support'
import * as matchers from '../drivers/index_api_rest_matchers'
import * as index from '../drivers/index_api_rest_test_support'
import * as gen from '../gen'
import axios from 'axios'
const chance = new Chance()
import { eventually } from '../drivers/eventually'

const axiosServer = axios.create({
    baseURL: 'http://localhost:8080'
})


export const streamToArray = async (stream) => { //todo: move this to utils

    return new Promise((resolve, reject) => {
        const arr = []

        stream.on('data', data => {
            arr.push(JSON.parse(data.toString()))
        });

        stream.on('end', () => {
            resolve(arr)
        });

        stream.on('error', (err) => reject(err))

    })
}

describe(`Velo External DB Index API: ${currentDbImplementationName()}`, () => {
    beforeAll(async () => {
        await setupDb()
        await initApp()
    })

    afterAll(async () => {
        await dbTeardown()
    }, 20000)

    test('list', async () => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        const response = await axiosServer.post('/indexes/list', {
            dataCollectionId: ctx.collectionName
        }, { responseType: 'stream', ...authOwner })

        // expect(streamToArray(response.data)).
        expect(streamToArray(response.data)).resolves.toEqual(matchers.listIndexResponseWithDefaultIndex())
    })

    test('list with multiple indexes', async () => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        await eventually(async () => {
            const response = await axiosServer.post('/indexes/list', {
                dataCollectionId: ctx.collectionName
            }, { responseType: 'stream', ...authOwner })
            await expect(streamToArray(response.data)).resolves.toEqual(matchers.listIndexResponseWith([ctx.index]))
        })
    })

    test('create', async () => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)

        // in-progress
        await expect(axiosServer.post('/indexes/create', {
            dataCollectionId: ctx.collectionName,
            index: ctx.index
        }, authOwner)).resolves.toEqual(matchers.createIndexResponseWith(ctx.index))

        // active
        await eventually(async () => {
            const response = await axiosServer.post('/indexes/list', {
                dataCollectionId: ctx.collectionName
            }, { responseType: 'stream', ...authOwner })
            await expect(streamToArray(response.data)).resolves.toEqual(matchers.listIndexResponseWith([ctx.index]))
        })
    })

    test('create with existing index', async () => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)

        eventually(async () => {
            await expect(axiosServer.post('/indexes/create', {
                dataCollectionId: ctx.collectionName,
                index: ctx.index
            }, authOwner)).rejects.toThrow()
        }, {
            timeout: 5000,
            interval: 1000
        })
    })

    test.only('remove', async() => {
        await schema.givenCollection(ctx.collectionName, [ctx.column], authOwner)
        await index.givenIndexes(ctx.collectionName, [ctx.index], authOwner)
        
        await eventually(async () => {
            await expect(axiosServer.post('/indexes/remove', {
                dataCollectionId: ctx.collectionName,
                indexName: ctx.index.name
                }, authOwner)).resolves.toEqual(matchers.removeIndexResponse()).catch()
        })

        // await expect(axiosServer.post('/indexes/remove', {
        //     dataCollectionId: ctx.collectionName,
        //     index: ctx.index
        // }, authOwner)).resolves.toEqual(matchers.removeIndexResponse())

        // const response = await axiosServer.post('/indexes/list', {
        //     dataCollectionId: ctx.collectionName
        // }, { responseType: 'stream', ...authOwner })
        // await expect(streamToArray(response.data)).resolves.not.toEqual(matchers.listIndexResponseWith([ctx.index]))
    })


    afterAll(async () => {
        await teardownApp()
    })

    const ctx = {
        collectionName: Uninitialized,
        column: Uninitialized,
        index: Uninitialized,
    }

    beforeEach(() => {
        ctx.collectionName = chance.word()
        ctx.column = gen.randomColumn()
        ctx.index = gen.spiIndexFor(ctx.collectionName, [ctx.column.name])
    })
});