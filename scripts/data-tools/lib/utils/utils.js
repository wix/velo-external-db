
const nonEmpty = input => !(!input || input.trim() === '')
const isNumber = input => Number.isInteger(parseInt(input))

module.exports = { nonEmpty, isNumber }
