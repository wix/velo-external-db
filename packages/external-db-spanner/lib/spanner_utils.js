const { escapeId } = require('mysql')

const recordSetToObj = (rows) => rows.map(row => row.toJSON())

const patchFieldName = (f) => {
    if (f.startsWith('_')) {
        return `x${f}`
    }
    return f
}

const unpatchFieldName = (f) => {
    if (f.startsWith('x_')) {
        return f.slice(1)
    }
    return f
}

module.exports = { recordSetToObj, escapeId, patchFieldName, unpatchFieldName }
