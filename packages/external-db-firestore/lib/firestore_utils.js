// const { escapeId } = require('mysql')
// const { InvalidQuery } = require('velo-external-db-commons').errors

// const recordSetToObj = (rows) => rows.map(row => row.toJSON())
//
// const patchFieldName = (f) => {
//     if (f.startsWith('_')) {
//         return `x${f}`
//     }
//     return f
// }
//
// const unpatchFieldName = (f) => {
//     if (f.startsWith('x_')) {
//         return f.slice(1)
//     }
//     return f
// }
//
const testLiteral = s => /^[a-zA-Z_0-9_]+$/.test(s)
const validateLiteral = l => {
    if (!testLiteral(l)) {
        throw new InvalidQuery(`Invalid literal`)
    }
    return `@${l}`
}

module.exports = { /*recordSetToObj, escapeId, patchFieldName, unpatchFieldName,*/ testLiteral, validateLiteral }
