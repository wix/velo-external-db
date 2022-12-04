import { authOwner } from "@wix-velo/external-db-testkit"
import { streamToArray } from "@wix-velo/test-commons"
import waitUntil from "async-wait-until"
import { CreateIndexRequest, Index, ListIndexesRequest } from "libs/velo-external-db-core/src/spi-model/indexing"

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

export const givenIndexes = async (collectionName: string, indexes: Index[], auth: any) => {
    for (const index of indexes) {
        await axios.post('/indexes/create', { dataCollectionId: collectionName, index } as CreateIndexRequest, auth)
    }
    await Promise.all(indexes.map(index => indexCreated(collectionName, index.name, auth)))
}

const indexCreated = async (collectionName: string, indexName: string, auth: any) => {
    await waitUntil(async () => {
        const indexes = await retrieveIndexesFor(collectionName) as Index[]
        return indexes.some(index => index.name === indexName)
    })
}

export const retrieveIndexesFor = async (collectionName: string) => axios.post('/indexes/list', { dataCollectionId: collectionName }, {responseType: 'stream', ...authOwner})
    .then(response => streamToArray(response.data))