const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')
const SqlString = require('tsqlstring')

const escapeId = s => SqlString.escapeId(s)
const escape = s => SqlString.escape(s)
const patchFieldName = s => `x${SqlString.escape(s).substring(1).slice(0, -1)}`
const validateLiteral = s => `@${patchFieldName(s)}`

module.exports = { wildCardWith, escapeId, validateLiteral, patchFieldName, escape }
