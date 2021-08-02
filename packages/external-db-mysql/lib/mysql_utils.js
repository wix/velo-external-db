const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

const isObject = (o) => typeof o === 'object' && o !== null

module.exports = { wildCardWith, isObject }
