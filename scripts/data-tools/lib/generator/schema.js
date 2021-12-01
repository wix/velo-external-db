const generateColumns = columnsCount => [...Array(parseInt(columnsCount))].map((e, i) => ({ name: `column_${i}`, type: 'text', subtype: 'string', precision: '256', isPrimary: false }))

module.exports = { generateColumns }