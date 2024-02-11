import { DataOperation } from '@wix-velo/velo-external-db-types'
import { AggregateRequest, CountRequest, InsertRequest, QueryRequest, UpdateRequest, RemoveRequest, TruncateRequest } from './spi-model/data_source'
import { RequestContext } from './types'

export const DataHooksForAction: { [key: string]: string[] } = {
    beforeQuery: ['beforeAll', 'beforeRead', 'beforeQuery'],
    afterQuery: ['afterAll', 'afterRead', 'afterQuery'],
    beforeCount: ['beforeAll', 'beforeRead', 'beforeCount'],
    afterCount: ['afterAll', 'afterRead', 'afterCount'],
    beforeAggregate: ['beforeAll', 'beforeRead', 'beforeAggregate'],
    afterAggregate: ['afterAll', 'afterRead', 'afterAggregate'],
    beforeInsert: ['beforeAll', 'beforeWrite', 'beforeInsert'],
    afterInsert: ['afterAll', 'afterWrite', 'afterInsert'],
    beforeUpdate: ['beforeAll', 'beforeWrite', 'beforeUpdate'],
    afterUpdate: ['afterAll', 'afterWrite', 'afterUpdate'],
    beforeRemove: ['beforeAll', 'beforeWrite', 'beforeRemove'],
    afterRemove: ['afterAll', 'afterWrite', 'afterRemove'],
    beforeTruncate: ['beforeAll', 'beforeWrite', 'beforeTruncate'],
    afterTruncate: ['afterAll', 'afterWrite', 'afterTruncate'],
}

export enum DataActions {
    BeforeQuery = 'beforeQuery',
    AfterQuery = 'afterQuery',
    BeforeCount = 'beforeCount',
    AfterCount = 'afterCount',
    BeforeAggregate = 'beforeAggregate',
    AfterAggregate = 'afterAggregate',
    BeforeInsert = 'beforeInsert',
    AfterInsert = 'afterInsert',
    BeforeUpdate = 'beforeUpdate',
    AfterUpdate = 'afterUpdate',
    BeforeRemove = 'beforeRemove',
    AfterRemove = 'afterRemove',
    BeforeTruncate = 'beforeTruncate',
    AfterTruncate = 'afterTruncate',
}


export const dataPayloadFor = (operation: DataOperation, body: any) => {
    switch (operation) {
        case DataOperation.query:
            return {
                collectionId: body.collectionId,
                query: body.query,
                includeReferencedItems: body.includeReferencedItems, // not supported
                consistentRead: body.consistentRead,
                returnTotalCount: body.returnTotalCount,
            } as QueryRequest
        case DataOperation.count:
            return {
                collectionId: body.collectionId,
                filter: body.filter,
                consistentRead: body.consistentRead,
            } as CountRequest
        case DataOperation.aggregate:
            return {
                collectionId: body.collectionId,
                initialFilter: body.initialFilter,
                aggregation: body.aggregation,
                finalFilter: body.finalFilter,
                sort: body.sort,
                paging: body.paging,
                consistentRead: body.consistentRead,
                returnTotalCount: body.returnTotalCount,
            } as AggregateRequest

        case DataOperation.insert:
            return {
                collectionId: body.collectionId,
                items: body.items,
            } as InsertRequest
        case DataOperation.update:
            return {
                collectionId: body.collectionId,
                items: body.items,
            } as UpdateRequest
        case DataOperation.remove:
            return {
                collectionId: body.collectionId,
                itemIds: body.itemIds,
            } as RemoveRequest
        case DataOperation.truncate:
            return {
                collectionId: body.collectionId,
            } as TruncateRequest
        default:
            return {
                collectionId: body.collectionId,
            }
    }
}

export const requestContextFor = (operation: any, body: any): RequestContext => ({ 
    operation, 
    collectionIds: body.collectionIds || [body.collectionId],
    metadata: body.metadata
})
