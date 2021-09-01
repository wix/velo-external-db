const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

// const { escapeId } = require('mysql')
const escapeId = s => s
const validateLiteral = s => `@${s}`
const patchFieldName = s => s
const escapeFieldId = s => s


module.exports = { wildCardWith, escapeId, validateLiteral, patchFieldName, escapeFieldId }
