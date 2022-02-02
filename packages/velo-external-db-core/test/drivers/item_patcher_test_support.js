const { when } = require('jest-when')
const { SystemFields } = require('velo-external-db-commons')

const itemTransformer = {
    prepareItemsForInsert: jest.fn(),
    prepareItemsForUpdate: jest.fn()
}

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

const givenPreparedItemsForInsertWith = (prepared, items) => 
    when(itemTransformer.prepareItemsForInsert).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)

const givenPreparedItemsForUpdateWith = (prepared, items) => 
    when(itemTransformer.prepareItemsForUpdate).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)


const reset = () => {
    itemTransformer.prepareItemsForInsert.mockClear()
    itemTransformer.prepareItemsForUpdate.mockClear()
}

module.exports = { itemTransformer, givenPreparedItemsForInsertWith, givenPreparedItemsForUpdateWith, reset }
