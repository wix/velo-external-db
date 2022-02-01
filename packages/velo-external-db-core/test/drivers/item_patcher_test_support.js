const { when } = require('jest-when')
const { SystemFields } = require('velo-external-db-commons')

const itemPatcher = {
    prepareItemsForInsert: jest.fn(),
    prepareItemsForUpdate: jest.fn()
}

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

const givenPreparedItemsForInsertWith = (prepared, items) => 
    when(itemPatcher.prepareItemsForInsert).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)

const givenPreparedItemsForUpdateWith = (prepared, items) => 
    when(itemPatcher.prepareItemsForUpdate).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)


const reset = () => {
    itemPatcher.prepareItemsForInsert.mockClear()
    itemPatcher.prepareItemsForUpdate.mockClear()
}

module.exports = { itemPatcher, givenPreparedItemsForInsertWith, givenPreparedItemsForUpdateWith, reset }
