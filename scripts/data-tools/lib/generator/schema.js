const Chance = require('chance')
const chance = Chance()

const generateColumns = columnsCount => [...Array(parseInt(columnsCount))].map(() => ({name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false}))

module.exports = { generateColumns }