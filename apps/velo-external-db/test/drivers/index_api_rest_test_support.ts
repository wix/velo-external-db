import { authOwner } from "@wix-velo/external-db-testkit"
import { CreateIndexRequest, Index, ListIndexesRequest } from "libs/velo-external-db-core/src/spi-model/indexing"

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

export const givenIndexes = async(collectionName: string, indexes: Index[], auth: any) => {
    for (const index of indexes) {
        await axios.post('/indexes/create', { dataCollectionId: collectionName, index } as CreateIndexRequest, auth)
    }
}

export const retrieveIndexesFor = async(collectionName: string) => axios.post('/indexes/list', { dataCollectionId: collectionName } as ListIndexesRequest, authOwner)