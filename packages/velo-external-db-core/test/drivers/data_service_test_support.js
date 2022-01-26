const { when } = require('jest-when')

const dataService = {
    find: jest.fn(),
    count: jest.fn(),
    getById: jest.fn(),
    insert: jest.fn(),
    bulkInsert: jest.fn(),
    update: jest.fn(),
    bulkUpdate: jest.fn(),
    truncate: jest.fn(),
    aggregate: jest.fn(),
    delete: jest.fn(),
    bulkDelete: jest.fn()
}

const givenListResult = (entities, totalCount, forCollectionName, filter, sort, skip, limit) => 
    when(dataService.find).calledWith(forCollectionName, filter, sort, skip, limit)
                          .mockResolvedValue( { items: entities, totalCount } )

const givenCountResult = (totalCount, forCollectionName, filter) =>
    when(dataService.count).calledWith(forCollectionName, filter)
                           .mockResolvedValue( { totalCount })

const givenGetByIdResult = (item, forCollectionName, itemId) => 
    when(dataService.getById).calledWith(forCollectionName, itemId)
                             .mockResolvedValue({ item })

const givenInsertResult = (item, forCollectionName) =>
    when(dataService.insert).calledWith(forCollectionName, item)
                             .mockResolvedValue({ item })

const givenBulkInsertResult = (items, forCollectionName) =>
    when(dataService.bulkInsert).calledWith(forCollectionName, items)
                             .mockResolvedValue({ items: items })

const givenUpdateResult = (item, forCollectionName) => 
    when(dataService.update).calledWith(forCollectionName, item)
                            .mockResolvedValue({ item })

const givenBulkUpdateResult = (items, forCollectionName) => 
    when(dataService.bulkUpdate).calledWith(forCollectionName, items)
                            .mockResolvedValue({ items })

const deleteResultTo = (itemId, forCollectionName) => 
    when(dataService.delete).calledWith(forCollectionName, itemId)
                            .mockResolvedValue({ item: {} })

const bulkDeleteResultTo = (itemIds, forCollectionName) => 
    when(dataService.bulkDelete).calledWith(forCollectionName, itemIds)
                                .mockResolvedValue({ items: [] })

const truncateResultTo = (forCollectionName) => 
    when(dataService.truncate).calledWith(forCollectionName)
                              .mockResolvedValue(1)

const givenAggregateResult = (items, forCollectionName, filter, aggregation) =>    
    when(dataService.aggregate).calledWith(forCollectionName, filter, aggregation)
                               .mockResolvedValue({ items, totalCount: 0 })
    
module.exports = { dataService, givenListResult, givenCountResult, givenGetByIdResult, givenInsertResult, givenBulkInsertResult, givenUpdateResult, givenBulkUpdateResult, deleteResultTo, bulkDeleteResultTo, truncateResultTo, givenAggregateResult }