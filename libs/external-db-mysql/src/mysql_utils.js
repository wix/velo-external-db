const { escapeId } = require('mysql')
const { errors, patchDateTime } = require('@wix-velo/velo-external-db-commons')

const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

const escapeTable = t => {
    if(t && t.indexOf('.') !== -1) {
        throw new errors.InvalidQuery('Illegal table name')
    }
    return escapeId(t)
}

const escapeIdField = f => f === '*' ? '*' : escapeId(f)

const patchObjectField = (item) => Object.entries(item).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'object' ? JSON.stringify(value) : value
        return acc
    }, {})


const patchItem = (item) => {
    const itemWithPatchedDateTime = patchDateTime(item)
    const itemWithPatchedObject = patchObjectField(itemWithPatchedDateTime)

    return itemWithPatchedObject
}

module.exports = { wildCardWith, escapeId: escapeIdField, escapeTable, patchItem }
