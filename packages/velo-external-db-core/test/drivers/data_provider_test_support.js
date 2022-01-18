const { unpackDates } = require('../../lib/converters/transform')
const { when } = require('jest-when')

const dataProvider = {
    find: jest.fn(),
    count: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    truncate: jest.fn(),
    aggregate: jest.fn(),
    delete: jest.fn(),
}

const givenListResult = (entities, forCollectionName, filter, sort, skip, andLimit) =>
    when(dataProvider.find).calledWith(forCollectionName, filter, sort, skip, andLimit)
                           .mockResolvedValue(entities.map( unpackDates ))

const givenCountResult = (total, forCollectionName, filter) =>
    when(dataProvider.count).calledWith(forCollectionName, filter)
                            .mockResolvedValue(total)

const givenTotalCountResult = (total, forCollectionName) =>
when(dataProvider.count).calledWith(forCollectionName)
                        .mockResolvedValue(total)
                        
const givenAggregateResult = (total, forCollectionName, filter, andAggregation) =>
    when(dataProvider.aggregate).calledWith(forCollectionName, filter, andAggregation)
                                .mockResolvedValue(total)

const expectInsertFor = (items, forCollectionName) =>
    when(dataProvider.insert).calledWith(forCollectionName, items.map(i => unpackDates(i)))
                             .mockResolvedValue(items.length)

const expectInsertMatchedFor = (items, forCollectionName) =>
    when(dataProvider.insert).calledWith(forCollectionName, expect.arrayContaining(items.map( expect.objectContaining )))
                             .mockResolvedValue(1)

const expectUpdateFor = (items, forCollectionName) =>
    when(dataProvider.update).calledWith(forCollectionName, items.map(i => unpackDates(i)))
                             .mockResolvedValue(items.length)

const expectDeleteFor = (itemIds, forCollectionName) =>
    when(dataProvider.delete).calledWith(forCollectionName, itemIds)
                             .mockResolvedValue(itemIds.length)

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
    dataProvider.delete.mockClear()
}

module.exports = { givenListResult, dataProvider, expectInsertFor, expectUpdateFor, givenCountResult, expectTruncateFor, givenAggregateResult, expectDeleteFor, expectInsertMatchedFor, givenTotalCountResult, reset }