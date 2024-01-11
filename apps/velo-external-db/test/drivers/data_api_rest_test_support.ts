import axios from 'axios'
import { Item } from '@wix-velo/velo-external-db-types'
import { dataSpi, convertersUtils } from '@wix-velo/velo-external-db-core'


const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/v3'
})

export const insertRequest = (collectionName: string, items: Item[]): dataSpi.InsertRequest => ({
    collectionId: collectionName,
    items,
})

export const updateRequest = (collectionName: string, items: Item[]): dataSpi.UpdateRequest => ({
    collectionId: collectionName,
    items
})

export const countRequest = (collectionName: string, filter: dataSpi.Filter = {}): dataSpi.CountRequest => ({
    collectionId: collectionName,
    filter,
    consistentRead: true,
})

export const queryRequest = (collectionName: string, sort: dataSpi.Sorting[], fields: string[], filter?: dataSpi.Filter, consistentRead = true, returnTotalCount = true): dataSpi.QueryRequest => ({
    collectionId: collectionName,
    query: {
        filter: filter ?? convertersUtils.EmptyFilter,
        sort,
        fields,
        paging: {
            limit: 25,
            offset: 0,
        },
    },
    consistentRead,
    returnTotalCount
})


export const queryCollectionAsArray = async(collectionName: string, sort: dataSpi.Sorting[], fields: string[], auth: any, filter?: dataSpi.Filter) =>
    await axiosInstance.post('/items/query',
        queryRequest(collectionName, sort, fields, filter), { transformRequest: auth.transformRequest }).then(res => res.data)


export const pagingMetadata = (count: number, total?: number) => ({ count, offset: 0, total })


export const givenItems = async(items: Item[], collectionName: string, auth: any) =>
    await axiosInstance.post('/items/insert', insertRequest(collectionName, items), { transformRequest: auth.transformRequest })
