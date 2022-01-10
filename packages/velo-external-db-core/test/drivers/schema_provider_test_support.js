const { when } = require('jest-when')

const schemaProvider = {
    list: jest.fn(),
    listHeaders: jest.fn(),
    describeCollection: jest.fn(),
    create: jest.fn(),
    addColumn: jest.fn(),
    removeColumn: jest.fn(),
    supportedOperations: jest.fn()
}

const givenListResult = (dbs) =>
    when(schemaProvider.list).mockResolvedValue(dbs)

const givenListHeadersResult = (collections) =>
    when(schemaProvider.listHeaders).mockResolvedValue(collections)

const givenSupportedOperations = (operations) =>
    when(schemaProvider.supportedOperations).mockReturnValue(operations)

const givenFindResults = (dbs) =>
    dbs.forEach(db => when(schemaProvider.describeCollection).calledWith(db.id).mockResolvedValue(db.fields) )

const expectCreateOf = (collectionName) =>
    when(schemaProvider.create).calledWith(collectionName)
                               .mockResolvedValue()

const expectCreateColumnOf = (column, collectionName) =>
    when(schemaProvider.addColumn).calledWith(collectionName, column)
                                  .mockResolvedValue()

const expectRemoveColumnOf = (columnName, collectionName) =>
    when(schemaProvider.removeColumn).calledWith(collectionName, columnName)
                                     .mockResolvedValue()

const reset = () => {
    schemaProvider.list.mockClear()
    schemaProvider.listHeaders.mockClear()
    schemaProvider.describeCollection.mockClear()
    schemaProvider.create.mockClear()
    schemaProvider.addColumn.mockClear()
    schemaProvider.removeColumn.mockClear()
    schemaProvider.supportedOperations.mockClear()
}


module.exports = { givenFindResults, expectRemoveColumnOf, givenListResult, givenListHeadersResult,
                   expectCreateOf, expectCreateColumnOf, givenSupportedOperations,
                   schemaProvider, reset }