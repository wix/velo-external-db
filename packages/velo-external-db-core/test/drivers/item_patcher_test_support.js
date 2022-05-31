const { when } = require('jest-when')
const { SystemFields } = require('@wix-velo/velo-external-db-commons')

const itemTransformer = {
    prepareItemsForInsert: jest.fn(),
    prepareItemsForUpdate: jest.fn(),
    patchItems: jest.fn()
}

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

const givenPreparedItemsForInsertWith = (prepared, items) => 
    when(itemTransformer.prepareItemsForInsert).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)

const givenPreparedItemsForUpdateWith = (prepared, items) => 
    when(itemTransformer.prepareItemsForUpdate).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)

const givenPatchedBooleanFieldsWith = (patched, items) =>
    when(itemTransformer.patchItems).calledWith(items, systemFields)
                                      .mockReturnValue(patched)

const reset = () => {
    itemTransformer.prepareItemsForInsert.mockClear()
    itemTransformer.prepareItemsForUpdate.mockClear()
    itemTransformer.patchItems.mockClear()
}

module.exports = { itemTransformer, givenPreparedItemsForInsertWith, givenPreparedItemsForUpdateWith, givenPatchedBooleanFieldsWith, reset }
