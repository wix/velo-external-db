const recordSetToObj = (rows) => rows.map(row => row.toJSON())

module.exports = { recordSetToObj }
