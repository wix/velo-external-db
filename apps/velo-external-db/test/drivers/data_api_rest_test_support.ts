import axios from 'axios'
import { Item } from '@wix-velo/velo-external-db-types'
import { dataSpi } from '@wix-velo/velo-external-db-core'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
})

export const insertRequest = (collectionName: string, items: Item[]): dataSpi.InsertRequest => ({
    collectionId: collectionName,
    items: items,
})

export const updateRequest = (collectionName: string, items: Item[]): dataSpi.UpdateRequest => ({
    collectionId: collectionName,
    items
})

export const countRequest = (collectionName: string, filter: dataSpi.Filter = {}): dataSpi.CountRequest => ({
    collectionId: collectionName,
    filter: filter,
    consistentRead: true,
})

export const queryRequest = (collectionName: string, sort: dataSpi.Sorting[], fields: string[], filter?: dataSpi.Filter, consistentRead = true, returnTotalCount = true): dataSpi.QueryRequest => ({
    collectionId: collectionName,
    query: {
        filter: filter ?? {},
        sort: sort,
        fields: fields,
        pagingMethod: {
            limit: 25,
            offset: 0,
        },
    },
    consistentRead,
    returnTotalCount
})


export const queryCollectionAsArray = async(collectionName: string, sort: dataSpi.Sorting[], fields: string[], auth: any, filter?: dataSpi.Filter) =>
    await axiosInstance.post('/data/query',
        queryRequest(collectionName, sort, fields, filter), { transformRequest: auth.transformRequest }).then(res => res.data)


export const pagingMetadata = (count: number, total?: number) => ({ count: count, offset: 0, total: total })


export const givenItems = async(items: Item[], collectionName: string, auth: any) =>
    await axiosInstance.post('/data/insert', insertRequest(collectionName, items), { transformRequest: auth.transformRequest })
