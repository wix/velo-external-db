import axios from 'axios'
import { Item } from '@wix-velo/velo-external-db-types'
import { dataSpi } from '@wix-velo/velo-external-db-core'
import { streamToArray } from '@wix-velo/test-commons'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
})

export const insertRequest = (collectionName: string, items: Item[], overwriteExisting: boolean): dataSpi.InsertRequest => ({
    collectionId: collectionName,
    items: items,
    overwriteExisting,
    options: {
        consistentRead: false,
        appOptions: {},
    }
})

export const updateRequest = (collectionName: string, items: Item[]): dataSpi.UpdateRequest => ({
    collectionId: collectionName,
    items: items,
    options: {
        consistentRead: false,
        appOptions: {},
    }
})

export const countRequest = (collectionName: string, filter?: dataSpi.Filter): dataSpi.CountRequest => ({
    collectionId: collectionName,
    filter: filter ?? '',
    options: {
        consistentRead: false,
        appOptions: {},
    },
})

export const queryRequest = (collectionName: string, sort: dataSpi.Sorting[], fields: string[], filter?: dataSpi.Filter): dataSpi.QueryRequest => ({
    collectionId: collectionName,
    query: {
        filter: filter ?? '',
        sort: sort,
        fields: fields,
        fieldsets: undefined,
        paging: {
            limit: 25,
            offset: 0,
        },
        cursorPaging: null
    },
    includeReferencedItems: [],
    options: {
        consistentRead: false,
        appOptions: {},
    },
    omitTotalCount: false
})


export const queryCollectionAsArray = (collectionName: string, sort: dataSpi.Sorting[], fields: string[], auth: any, filter?: dataSpi.Filter) =>
    axiosInstance.post('/data/query',
        queryRequest(collectionName, sort, fields, filter), { responseType: 'stream', transformRequest: auth.transformRequest })
        .then(response => streamToArray(response.data))


export const pagingMetadata = (count: number, total?: number): dataSpi.QueryResponsePart => ({ pagingMetadata: { count: count, offset: 0, total: total, tooManyToCount: false } })


export const givenItems = async(items: Item[], collectionName: string, auth: any) =>
    await axiosInstance.post('/data/insert', insertRequest(collectionName, items, false), { responseType: 'stream', transformRequest: auth.transformRequest })
