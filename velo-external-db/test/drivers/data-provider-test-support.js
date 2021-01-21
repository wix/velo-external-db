const sinon = require('sinon');
const DataProvider = require('../../src/storage/storage')

const dataProvider = sinon.createStubInstance(DataProvider)

const givenListResult = (entities, forCollectionName, filter, sort, skip, andLimit) =>
    dataProvider.list.withArgs(forCollectionName, filter, sort, skip, andLimit).returns(Promise.resolve(entities))

module.exports = { givenListResult, dataProvider }