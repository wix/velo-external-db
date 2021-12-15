const { when } = require('jest-when')

const schemaProvider = {
    list: jest.fn(),
    describeCollection: jest.fn(),
    create: jest.fn(),
    addColumn: jest.fn(),
    removeColumn: jest.fn(),
}

const givenListResult = (dbs) =>
    when(schemaProvider.list).mockResolvedValue(dbs)

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
    schemaProvider.describeCollection.mockClear()
    schemaProvider.create.mockClear()
    schemaProvider.addColumn.mockClear()
    schemaProvider.removeColumn.mockClear()
}


module.exports = { givenFindResults, expectRemoveColumnOf, givenListResult, expectCreateOf, expectCreateColumnOf, schemaProvider, reset }