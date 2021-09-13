// const SqlString = require('tsqlstring')

const escapeId = s => s //SqlString.escapeId(s)
const escape = s => s //SqlString.escape(s)
const patchFieldName = s => s //`x${SqlString.escape(s).substring(1).slice(0, -1)}`
const validateLiteral = s => s //`@${patchFieldName(s)}`
const dbName = client => client.topology.s.options.dbName

module.exports = { escapeId, validateLiteral, patchFieldName, escape, dbName }
