import { streamToArray } from '@wix-velo/test-commons'
import waitUntil from 'async-wait-until'
import { indexSpi } from '@wix-velo/velo-external-db-core'

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

export const givenIndexes = async(collectionName: string, indexes: indexSpi.Index[], auth: any) => {
    for (const index of indexes) {
        await axios.post('/indexes/create', { dataCollectionId: collectionName, index } as indexSpi.CreateIndexRequest, auth)
    }
    await Promise.all(indexes.map(index => indexCreated(collectionName, index.name, auth)))
}

const indexCreated = async(collectionName: string, indexName: string, auth: any) => {
    await waitUntil(async() => {
        const indexes = await retrieveIndexesFor(collectionName, auth) as indexSpi.Index[]
        return indexes.some(index => index.name === indexName)
    })
}

export const retrieveIndexesFor = async(collectionName: string, auth: any) => axios.post('/indexes/list', { dataCollectionId: collectionName }, { responseType: 'stream', ...auth })
    .then(response => streamToArray(response.data))