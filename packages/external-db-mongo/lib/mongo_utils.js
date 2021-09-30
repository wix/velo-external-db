const EMPTY_FILTER = {filterExpr:{}}
const notConnectedPool = (err) => {
    return {
        db: ()=> { throw err },
    }
}

const isConnected = (client) => {
    return  client && client.topology && client.topology.isConnected()
}

module.exports = { EMPTY_FILTER, notConnectedPool, isConnected }
