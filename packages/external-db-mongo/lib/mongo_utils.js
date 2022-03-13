const { isObject } = require('velo-external-db-commons')
const { InvalidQuery } = require('velo-external-db-commons').errors

const SystemTable = '_descriptor'
const isSystemTable = collectionId => SystemTable === collectionId.trim().toLowerCase()

const validateTable = collection => {
    if (collection && isSystemTable(collection) ) {
        throw new InvalidQuery('Illegal table name')
    }
}

const EmptyFilter = { filterExpr: {} }
const notConnectedPool = err => ( {
        pool: { db: () => { throw err } },
        cleanup: () => { }
    } )

const emptyClient = () => ( {
        connect: async() => { console.log('No URI was provided') }
    } )

const isConnected = (client) => {
    return  client && client.topology && client.topology.isConnected()
}

const updateExpressionForItem = (item) => ( { updateOne: { filter: { _id: item._id },
                                                           update: { $set: { ...item } } } } )

const updateExpressionFor = items => items.map( updateExpressionForItem )

const unpackIdFieldForItem = item => {
    if (isObject(item._id)) {
        const item2 = { ...item, ...item._id }
        if (isObject(item2._id)) delete item2._id
        return item2
    }
    return item
}

module.exports = { EmptyFilter, notConnectedPool, isConnected, unpackIdFieldForItem, updateExpressionFor, validateTable, SystemTable, emptyClient }
