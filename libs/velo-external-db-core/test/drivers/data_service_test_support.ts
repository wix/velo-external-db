import { when } from 'jest-when'
import { SystemFields } from '@wix-velo/velo-external-db-commons'

export const dataService = {
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

const systemFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )

export const givenListResult = (entities: any, totalCount: any, forCollectionName: any, filter: any, sort: any, skip: any, limit: any, projection: any, omitTotalCount?: boolean) =>
    when(dataService.find).calledWith(forCollectionName, filter, sort, skip, limit, projection, omitTotalCount)
                          .mockResolvedValue( { items: entities, totalCount } )

export const givenCountResult = (totalCount: any, forCollectionName: any, filter: any) =>
    when(dataService.count).calledWith(forCollectionName, filter)
                           .mockResolvedValue( { totalCount })

export const givenGetByIdResult = (item: any, forCollectionName: any, itemId: any, projection: any) => 
    when(dataService.getById).calledWith(forCollectionName, itemId, projection)
                             .mockResolvedValue({ item })

export const givenInsertResult = (item: any, forCollectionName: any) =>
    when(dataService.insert).calledWith(forCollectionName, item, systemFields)
                             .mockResolvedValue({ item })

export const givenBulkInsertResult = (items: any, forCollectionName: any) =>
    when(dataService.bulkInsert).calledWith(forCollectionName, items, systemFields)
                             .mockResolvedValue({ items })

export const givenUpdateResult = (item: any, forCollectionName: any) => 
    when(dataService.update).calledWith(forCollectionName, item)
                            .mockResolvedValue({ item })

export const givenBulkUpdateResult = (items: any, forCollectionName: any) => 
    when(dataService.bulkUpdate).calledWith(forCollectionName, items)
                            .mockResolvedValue({ items })

export const deleteResultTo = (itemId: any, forCollectionName: any, projection: any) => 
    when(dataService.delete).calledWith(forCollectionName, itemId, projection)
                            .mockResolvedValue({ item: {} })

export const bulkDeleteResultTo = (itemIds: any, forCollectionName: any, projection: any) => 
    when(dataService.bulkDelete).calledWith(forCollectionName, itemIds, projection)
                                .mockResolvedValue({ items: [] })

export const truncateResultTo = (forCollectionName: any) => 
    when(dataService.truncate).calledWith(forCollectionName)
                              .mockResolvedValue(1)

export const givenAggregateResult = (items: any, forCollectionName: any, filter: any, aggregation: any, sort: any, skip: any, limit: any, returnTotalCount = true) =>    
    when(dataService.aggregate).calledWith(forCollectionName, filter, aggregation, sort, skip, limit, returnTotalCount)
                               .mockResolvedValue({ items, totalCount: 0 })

export const reset = () => {
    dataService.find.mockClear()
    dataService.count.mockClear()
    dataService.getById.mockClear()
    dataService.insert.mockClear()
    dataService.bulkInsert.mockClear()
    dataService.update.mockClear()
    dataService.bulkUpdate.mockClear()
    dataService.truncate.mockClear()
    dataService.aggregate.mockClear()
    dataService.delete.mockClear()
    dataService.bulkDelete.mockClear()
}
