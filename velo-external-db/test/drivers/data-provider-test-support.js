const sinon = require('sinon');
const DataProvider = require('../../src/storage/storage')
const { unpackDates } = require('../../src/service/transform')
const dataProvider = sinon.createStubInstance(DataProvider)

const givenListResult = (entities, forCollectionName, filter, sort, skip, andLimit) =>
    dataProvider.find.withArgs(forCollectionName, filter, sort, skip, andLimit).resolves(entities.map( unpackDates ))

const givenCountResult = (total, forCollectionName, filter) =>
    dataProvider.count.withArgs(forCollectionName, filter).resolves(total)

const expectInsertFor = (item, forCollectionName) =>
    dataProvider.insert.withArgs(forCollectionName, unpackDates(item)).resolves(1)

const expectUpdateFor = (item, forCollectionName) =>
    dataProvider.update.withArgs(forCollectionName, unpackDates(item)).resolves(1)


module.exports = { givenListResult, dataProvider, expectInsertFor, expectUpdateFor, givenCountResult }