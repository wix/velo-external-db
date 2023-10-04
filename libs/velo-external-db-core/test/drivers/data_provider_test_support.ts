import { when } from 'jest-when'
import { Item } from '@wix-velo/velo-external-db-types'
import { getByIdFilterFor } from '../../src/utils/data_utils'
import { errors as domainErrors } from '@wix-velo/velo-external-db-commons'

export const dataProvider = {
    find: jest.fn(),
    count: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    truncate: jest.fn(),
    aggregate: jest.fn(),
    delete: jest.fn(),
}

export const givenListResult = (entities: any, forCollectionName: any, filter: any, sort: any, skip: any, andLimit: any, projection: any) =>
    when(dataProvider.find).calledWith(forCollectionName, filter, sort, skip, andLimit, projection)
                           .mockResolvedValue(entities)

export const givenItemsById = (entities: Item[], forCollectionName: any, sort: any, skip: any, limit: any, projection: any) =>
    entities.forEach( (entity) => when(dataProvider.find).calledWith(forCollectionName, getByIdFilterFor(entity._id!), sort, skip, limit, projection)
                                                         .mockResolvedValue([entity])
    )

export const givenCountResult = (total: any, forCollectionName: any, filter: any) =>
    when(dataProvider.count).calledWith(forCollectionName, filter)
                            .mockResolvedValue(total)

export const givenAggregateResult = (total: any, forCollectionName: any, filter: any, andAggregation: any, sort: any, skip: any, limit: any) =>
    when(dataProvider.aggregate).calledWith(forCollectionName, filter, andAggregation, sort, skip, limit)
                                .mockResolvedValue(total)

export const expectInsertFor = (items: any[], forCollectionName: any, projection: any) =>
    items.forEach(i => when(dataProvider.insert).calledWith(forCollectionName, [i], projection).mockResolvedValue(1))

export const expectInsertAlreadyExistsFor = (items: any[], forCollectionName: any, projection: any) =>
    items.forEach(i => when(dataProvider.insert).calledWith(forCollectionName, [i], projection).mockRejectedValue(new domainErrors.ItemAlreadyExists('')))

export const expectInsertMatchedFor = (items: any, forCollectionName: any) =>
    when(dataProvider.insert).calledWith(forCollectionName, expect.arrayContaining(items.map( expect.objectContaining )))
                             .mockResolvedValue(1)

export const expectUpdateFor = (items: any[], forCollectionName: any) =>
    items.forEach(i => when(dataProvider.update).calledWith(forCollectionName, [i])
                                                .mockResolvedValue(1)
                )

export const expectDeleteFor = (itemIds: string | any[], forCollectionName: any) =>
    when(dataProvider.delete).calledWith(forCollectionName, itemIds)
                             .mockResolvedValue(itemIds.length)

export const expectTruncateFor = (collectionName: any) =>
    when(dataProvider.truncate).calledWith(collectionName)
                               .mockResolvedValue(1)

export const reset = () => {
    dataProvider.find.mockClear()
    dataProvider.count.mockClear()
    dataProvider.insert.mockClear()
    dataProvider.update.mockClear()
    dataProvider.truncate.mockClear()
    dataProvider.aggregate.mockClear()
    dataProvider.delete.mockClear()
}
