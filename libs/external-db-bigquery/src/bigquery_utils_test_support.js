const { when } = require('jest-when')

const bigQueryItem = {}

const givenNullValueTo = ( propertyName ) => bigQueryItem[propertyName] = null


const givenNumberValueTo = (propertyName, number) => {
    bigQueryItem[propertyName] = { toNumber: jest.fn() }
    when(bigQueryItem[propertyName].toNumber).calledWith().mockReturnValue(number)
}

const givenDateValueTo = (propertyName, date) => {
    bigQueryItem[propertyName] = { value: date.toISOString() }
}

const givenWrongFormatDateValueTo = (propertyName, date) => {
    bigQueryItem[propertyName] = date.toISOString()
}

const reset = () => {
    Object.keys(bigQueryItem).forEach(key => delete bigQueryItem[key])
}


module.exports = {  bigQueryItem, givenNullValueTo, givenNumberValueTo,
     givenDateValueTo, givenWrongFormatDateValueTo, reset }