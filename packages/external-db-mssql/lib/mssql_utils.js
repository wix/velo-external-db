const SqlString = require('tsqlstring')
const { InvalidQuery } = require('velo-external-db-commons').errors

const escapeId = s => SqlString.escapeId(s)
const escape = s => SqlString.escape(s)
const escapeTable = s => {
    if(s && s.indexOf('.') !== -1) {
        throw new InvalidQuery('Illegal table name')
    }
    return escapeId(s)
}
const patchFieldName = s => `x${SqlString.escape(s).substring(1).slice(0, -1)}`
const validateLiteral = s => `@${patchFieldName(s)}`
const notConnectedPool = (pool, err) => {
    return {
        ...pool,
        query: async () => { throw err },
        request: async () => { throw err },
        connect: async () => { return await pool.connect() }
    }
}
module.exports = { escapeId, validateLiteral, patchFieldName, escape, notConnectedPool, escapeTable }
