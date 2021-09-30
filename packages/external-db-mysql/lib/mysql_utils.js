const { escapeId } = require('mysql')

const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

module.exports = { wildCardWith, escapeId }
