const SqlString = require('tsqlstring')

const escapeId = s => SqlString.escapeId(s)
const escape = s => SqlString.escape(s)
const patchFieldName = s => `x${SqlString.escape(s).substring(1).slice(0, -1)}`
const validateLiteral = s => `@${patchFieldName(s)}`
const notConnectedPool = (pool, err) => {
    return {
        ...pool,
        query: () => { throw err },
        request: () => { throw err },
        connect: async () => { return await pool.connect() }
    }
}
module.exports = { escapeId, validateLiteral, patchFieldName, escape, notConnectedPool }
