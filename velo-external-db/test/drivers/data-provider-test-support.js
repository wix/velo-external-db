const { unpackDates } = require('../../src/service/transform')
const { when } = require('jest-when')

const dataProvider = {
    find: jest.fn(),
    count: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    truncate: jest.fn(),
    aggregate: jest.fn(),
}

const givenListResult = (entities, forCollectionName, filter, sort, skip, andLimit) =>
    when(dataProvider.find).calledWith(forCollectionName, filter, sort, skip, andLimit)
                           .mockResolvedValue(entities.map( unpackDates ))

const givenCountResult = (total, forCollectionName, filter) =>
    when(dataProvider.count).calledWith(forCollectionName, filter)
                            .mockResolvedValue(total)

const givenAggregateResult = (total, forCollectionName, filter, andAggregation) =>
    when(dataProvider.aggregate).calledWith(forCollectionName, filter, andAggregation)
                                .mockResolvedValue(total)

const expectInsertFor = (items, forCollectionName) =>
    when(dataProvider.insert).calledWith(forCollectionName, items.map(i => unpackDates(i)))
                             .mockResolvedValue(items.length)


const expectUpdateFor = (items, forCollectionName) =>
    when(dataProvider.update).calledWith(forCollectionName, items.map(i => unpackDates(i)))
                             .mockResolvedValue(items.length)

const expectTruncateFor = (collectionName) =>
    when(dataProvider.truncate).calledWith(collectionName)
                               .mockResolvedValue(1)

const reset = () => {
    dataProvider.find.mockClear()
    dataProvider.count.mockClear()
    dataProvider.insert.mockClear()
    dataProvider.update.mockClear()
    dataProvider.truncate.mockClear()
    dataProvider.aggregate.mockClear()
}

module.exports = { givenListResult, dataProvider, expectInsertFor, expectUpdateFor, givenCountResult, expectTruncateFor, givenAggregateResult, reset }