const sinon = require('sinon');
const { SchemaProvider } = require('../../src/storage/storage')
const schemaProvider = sinon.createStubInstance(SchemaProvider)

const givenListResult = (dbs) =>
    schemaProvider.list.resolves(dbs)

const givenFindResults = (dbs) =>
    dbs.forEach(db => schemaProvider.describeCollection.withArgs(db.id).resolves(db))

const expectCreateOf = (collectionName) =>
    schemaProvider.create.withArgs(collectionName).resolves()

const expectCreateColumnOf = (column, collectionName) =>
    schemaProvider.addColumn.withArgs(collectionName, column).resolves()

const expectRemoveColumnOf = (columnName, collectionName) =>
    schemaProvider.removeColumn.withArgs(collectionName, columnName).resolves()


module.exports = { givenFindResults, expectRemoveColumnOf, givenListResult, expectCreateOf, expectCreateColumnOf, schemaProvider }