const { escapeId } = require('mysql')

const recordSetToObj = (rows) => rows.map(row => row.toJSON())

module.exports = { recordSetToObj, escapeId }
