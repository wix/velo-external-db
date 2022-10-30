import { Item } from '@wix-velo/velo-external-db-types'
import { Options, QueryRequest, QueryV2 } from 'libs/velo-external-db-core/src/spi-model/data_source'

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

export const givenItems = async(items: Item[], collectionName: string, auth: any) => await axios.post('/data/insert/bulk', { collectionName: collectionName, items: items }, auth)

export const expectAllDataIn = async(collectionName: string, auth: any) => (await axios.post('/data/find', { collectionName: collectionName, filter: '', sort: '', skip: 0, limit: 25 }, auth)).data