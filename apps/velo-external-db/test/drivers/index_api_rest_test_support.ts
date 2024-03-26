import axios from 'axios'
import waitUntil from 'async-wait-until'
import { indexSpi } from '@wix-velo/velo-external-db-core'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/v3'
})

export const givenIndexes = async(collectionName: string, indexes: indexSpi.Index[], auth: any) => {    
    for (const index of indexes) {
        await axiosInstance.post('/indexes/create', { collectionId: collectionName, index } as indexSpi.CreateIndexRequest, auth)
    }
    await Promise.all(indexes.map(index => indexCreated(collectionName, index.name, auth)))
}

const indexCreated = async(collectionName: string, indexName: string, auth: any) => {
    await waitUntil(async() => {
        const { indexes } = await retrieveIndexesFor(collectionName, auth) as indexSpi.ListIndexesResponse
        return indexes.some(index => index.name === indexName)
    })
}

export const createIndexFor = async(collectionName: string, index: indexSpi.Index, auth: any) => await
    axiosInstance.post('/indexes/create', { collectionId: collectionName, index } as indexSpi.CreateIndexRequest, auth).then(res => res.data)

export const removeIndexFor = async(collectionName: string, indexName: string, auth: any) => await
    axiosInstance.post('/indexes/remove', { collectionId: collectionName, indexName } as indexSpi.RemoveIndexRequest, auth).then(res => res.data)

export const retrieveIndexesFor = async(collectionName: string, auth: any) => await 
axiosInstance.post('/indexes/list', { collectionId: collectionName } as indexSpi.ListIndexesRequest, { transformRequest: auth.transformRequest }).then(res => res.data)
