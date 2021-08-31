const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

// const { escapeId } = require('mysql')
const escapeId = s => s

module.exports = { wildCardWith, escapeId }
