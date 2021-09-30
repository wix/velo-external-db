const { isObject } = require('velo-external-db-commons')

const EMPTY_FILTER = {filterExpr:{}}
const notConnectedPool = (err) => {
    return {
        db: ()=> { throw err },
    }
}

const isConnected = (client) => {
    return  client && client.topology && client.topology.isConnected()
}

const flatAggregation = (item) => {
    if (isObject(item._id)) {
        Object.assign(item, item._id)
        if (isObject(item._id)) delete item._id
    }
    return item
} // todo - refactor 

module.exports = { EMPTY_FILTER, notConnectedPool, isConnected, flatAggregation }
