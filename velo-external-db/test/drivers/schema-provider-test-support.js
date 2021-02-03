const sinon = require('sinon');
const { SchemaProvider } = require('../../src/storage/storage')
const schemaProvider = sinon.createStubInstance(SchemaProvider)

const givenListResult = (dbs) =>
    schemaProvider.list.resolves(dbs)

const expectCreateOf = (collectionName) =>
    schemaProvider.create.withArgs(collectionName).resolves()

const expectCreateColumnOf = (column, collectionName) =>
    schemaProvider.addColumn.withArgs(collectionName, column).resolves()

const expectRemoveColumnOf = (columnName, collectionName) =>
    schemaProvider.removeColumn.withArgs(collectionName, columnName).resolves()


module.exports = { expectRemoveColumnOf, givenListResult, expectCreateOf, expectCreateColumnOf, schemaProvider }