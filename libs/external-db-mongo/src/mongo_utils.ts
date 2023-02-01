import { isObject } from '@wix-velo/velo-external-db-commons'
const { errors } = require('@wix-velo/velo-external-db-commons')
const { InvalidQuery } = errors

export const SystemTable = '_descriptor'
const isSystemTable = (collectionId: string) => SystemTable === collectionId.trim().toLowerCase()

export const validateTable = (collection: any) => {
    if (collection && isSystemTable(collection)) {
        throw new InvalidQuery('Illegal table name')
    }
}

export const EmptyFilter = { filterExpr: {} }

export type MongoStubPool = {
    db(): any,
    close: () => Promise<void>,
}

export const notConnectedPool = (err: any): MongoStubPool => ({
    db: () => { throw err },
    close: async() => { },
})

export type MongoStubClient = {
    connect: () => Promise<MongoStubPool>
}

export const emptyClient = (): MongoStubClient => ({
    connect: async() => notConnectedPool(new Error('No URI was provided')),
})

export const isConnected = (client: { topology: { isConnected: () => any } }) => {
    return client && client.topology && client.topology.isConnected()
}

const updateExpressionForItem = (item: { _id: any }) => ({
    updateOne: {
        filter: { _id: item._id },
        update: { $set: { ...item } }
    }
})


export const updateExpressionFor = (items: any[]) => items.map(updateExpressionForItem)

export const unpackIdFieldForItem = (item: { [x: string]: any, _id?: any }) => {
    if (isObject(item._id)) {
        const item2 = { ...item, ...item._id }
        if (isObject(item2._id)) delete item2._id
        return item2
    }
    return item
}

export const EmptySort = {
    sortExpr: { sort: [] },
}

export interface CollectionObject {
    _id: string,
    fields: { name: string, type: string, subtype?: string }[]
}
