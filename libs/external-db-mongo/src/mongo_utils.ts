import { isObject } from '@wix-velo/velo-external-db-commons'
import { ConnectionCleanUp } from '@wix-velo/velo-external-db-types'
const { errors } = require('@wix-velo/velo-external-db-commons')
const { InvalidQuery } = errors

const SystemTable = '_descriptor'
const isSystemTable = (collectionId: string) => SystemTable === collectionId.trim().toLowerCase()

const validateTable = (collection: any) => {
    if (collection && isSystemTable(collection)) {
        throw new InvalidQuery('Illegal table name')
    }
}

const EmptyFilter = { filterExpr: {} }

type MongoStubPool = {
    db(): any,
    close: () => Promise<void>,
}

const notConnectedPool = (err: any): MongoStubPool => ({
    db: () => { throw err } ,
    close: async () => { },
})

type MongoStubClient = {
    connect: () => Promise<MongoStubPool>
}

// const emptyClient = (): MongoStubClient => ({
//     connect: async () => { console.log('No URI was provided') }
// })

const emptyClient = (): MongoStubClient => ({
    connect: async () => notConnectedPool(new Error('No URI was provided')),
})

const isConnected = (client: { topology: { isConnected: () => any } }) => {
    return client && client.topology && client.topology.isConnected()
}

const updateExpressionForItem = (item: { _id: any }) => ({
    updateOne: {
        filter: { _id: item._id },
        update: { $set: { ...item } }
    }
})

const updateExpressionFor = (items: any[]) => items.map(updateExpressionForItem)

const unpackIdFieldForItem = (item: { [x: string]: any, _id?: any }) => {
    if (isObject(item._id)) {
        const item2 = { ...item, ...item._id }
        if (isObject(item2._id)) delete item2._id
        return item2
    }
    return item
}

export {
    EmptyFilter, notConnectedPool, isConnected, unpackIdFieldForItem, updateExpressionFor,
    validateTable, SystemTable, emptyClient, MongoStubPool, MongoStubClient
}
