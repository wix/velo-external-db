const { when } = require('jest-when')
const { SystemFields } = require('velo-external-db-commons')

const itemTransformer = {
    prepareItemsForInsert: jest.fn(),
    prepareItemsForUpdate: jest.fn(),
    patchItemsBooleanFields: jest.fn()
}

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

const givenPreparedItemsForInsertWith = (prepared, items) => 
    when(itemTransformer.prepareItemsForInsert).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)

const givenPreparedItemsForUpdateWith = (prepared, items) => 
    when(itemTransformer.prepareItemsForUpdate).calledWith(items, systemFields)
                                           .mockReturnValue(prepared)

const givenPatchedBooleanFieldsWith = (patched, items) =>
    when(itemTransformer.patchItemsBooleanFields).calledWith(items, systemFields)
                                      .mockReturnValue(patched)

const reset = () => {
    itemTransformer.prepareItemsForInsert.mockClear()
    itemTransformer.prepareItemsForUpdate.mockClear()
    itemTransformer.patchItemsBooleanFields.mockClear()
}

module.exports = { itemTransformer, givenPreparedItemsForInsertWith, givenPreparedItemsForUpdateWith, givenPatchedBooleanFieldsWith, reset }
