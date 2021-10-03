const { isObject } = require('velo-external-db-commons')

const EMPTY_FILTER = {filterExpr:{}}
const notConnectedPool = err => ( {
        pool: { db: ()=> { throw err } },
        cleanup: () => { }
    } )

const isConnected = (client) => {
    return  client && client.topology && client.topology.isConnected()
}

const updateExpressionForItem = (item) => ( { updateOne: { filter: { _id: item._id },
                                                           update: { $set: { ...item } } } } )

const updateExpressionFor = items => items.map( updateExpressionForItem )

const unpackIdFieldForItem = item => {
    if (isObject(item._id)) {
        Object.assign(item, item._id)
        if (isObject(item._id)) delete item._id
    }
    return item
}

module.exports = { EMPTY_FILTER, notConnectedPool, isConnected, unpackIdFieldForItem, updateExpressionFor }
