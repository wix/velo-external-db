import { Item, WixDataFilter } from '@wix-velo/velo-external-db-types'
import { AggregateRequest, CountRequest, QueryRequest } from './spi-model/data_source'
import { FindQuery, RequestContext } from './types'


export const DataHooksForAction: { [key: string]: string[] } = {
    beforeFind: ['beforeAll', 'beforeRead', 'beforeFind'],
    afterFind: ['afterAll', 'afterRead', 'afterFind'],
    beforeInsert: ['beforeAll', 'beforeWrite', 'beforeInsert'],
    afterInsert: ['afterAll', 'afterWrite', 'afterInsert'],
    beforeBulkInsert: ['beforeAll', 'beforeWrite', 'beforeBulkInsert'],
    afterBulkInsert: ['afterAll', 'afterWrite', 'afterBulkInsert'],
    beforeUpdate: ['beforeAll', 'beforeWrite', 'beforeUpdate'],
    afterUpdate: ['afterAll', 'afterWrite', 'afterUpdate'],
    beforeBulkUpdate: ['beforeAll', 'beforeWrite', 'beforeBulkUpdate'],
    afterBulkUpdate: ['afterAll', 'afterWrite', 'afterBulkUpdate'],
    beforeRemove: ['beforeAll', 'beforeWrite', 'beforeRemove'],
    afterRemove: ['afterAll', 'afterWrite', 'afterRemove'],
    beforeBulkRemove: ['beforeAll', 'beforeWrite', 'beforeBulkRemove'],
    afterBulkRemove: ['afterAll', 'afterWrite', 'afterBulkRemove'],
    beforeAggregate: ['beforeAll', 'beforeRead', 'beforeAggregate'],
    afterAggregate: ['afterAll', 'afterRead', 'afterAggregate'],
    beforeCount: ['beforeAll', 'beforeRead', 'beforeCount'],
    afterCount: ['afterAll', 'afterRead', 'afterCount'],
    beforeGetById: ['beforeAll', 'beforeRead', 'beforeGetById'],
    afterGetById: ['afterAll', 'afterRead', 'afterGetById'],
}

export const DataHooksForActionV3: { [key: string]: string[] } = {
    beforeQuery: ['beforeAll', 'beforeRead', 'beforeQuery'],
    afterQuery: ['afterAll', 'afterRead', 'afterQuery'],
    beforeCount: ['beforeAll', 'beforeRead', 'beforeCount'],
    afterCount: ['afterAll', 'afterRead', 'afterCount'],
    beforeAggregate: ['beforeAll', 'beforeRead', 'beforeAggregate'],
    afterAggregate: ['afterAll', 'afterRead', 'afterAggregate'],
}


export enum DataOperations {
    Find = 'find',
    Insert = 'insert',
    BulkInsert = 'bulkInsert',
    Update = 'update',
    BulkUpdate = 'bulkUpdate',
    Remove = 'remove',
    BulkRemove = 'bulkRemove',
    Aggregate = 'aggregate',
    Count = 'count',
    Get = 'getById',
}

export enum DataOperationsV3 {
    Query = 'query',
    Count = 'count',
    Aggregate = 'aggregate',
}

export enum DataActionsV3 {
    BeforeQuery = 'beforeQuery',
    AfterQuery = 'afterQuery',
    BeforeCount = 'beforeCount',
    AfterCount = 'afterCount',
    BeforeAggregate = 'beforeAggregate',
    AfterAggregate = 'afterAggregate',
}

export const DataActions = {
    BeforeFind: 'beforeFind',
    AfterFind: 'afterFind',
    BeforeInsert: 'beforeInsert',
    AfterInsert: 'afterInsert',
    BeforeBulkInsert: 'beforeBulkInsert',
    AfterBulkInsert: 'afterBulkInsert',
    BeforeUpdate: 'beforeUpdate',
    AfterUpdate: 'afterUpdate',
    BeforeBulkUpdate: 'beforeBulkUpdate',
    AfterBulkUpdate: 'afterBulkUpdate',
    BeforeRemove: 'beforeRemove',
    AfterRemove: 'afterRemove',
    BeforeBulkRemove: 'beforeBulkRemove',
    AfterBulkRemove: 'afterBulkRemove',
    BeforeAggregate: 'beforeAggregate',
    AfterAggregate: 'afterAggregate',
    BeforeCount: 'beforeCount',
    AfterCount: 'afterCount',
    BeforeGetById: 'beforeGetById',
    AfterGetById: 'afterGetById',
    BeforeAll: 'beforeAll',
    AfterAll: 'afterAll',
    BeforeRead: 'beforeRead',
    AfterRead: 'afterRead',
    BeforeWrite: 'beforeWrite',
    AfterWrite: 'afterWrite'
}

export const dataPayloadForV3 = (operation: DataOperationsV3, body: any) => {
    switch (operation) {
        case DataOperationsV3.Query:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                query: body.query,
                includeReferencedItems: body.includeReferencedItems, // not supported
                omitTotalCount: body.omitTotalCount,
                options: body.options // not supported
            } as QueryRequest
        case DataOperationsV3.Count:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                filter: body.filter,
                options: body.options // not supported
            } as CountRequest
        case DataOperationsV3.Aggregate:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                initialFilter: body.initialFilter,
                distinct: body.distinct, // not supported
                group: body.group,
                finalFilter: body.finalFilter,
                sort: body.sort,
                paging: body.paging,
                options: body.options, // not supported
                omitTotalCount: body.omitTotalCount
            } as AggregateRequest
    }
}


export const dataPayloadFor = (operation: DataOperations, body: any) => {
    switch (operation) {
        case DataOperations.Find:
            return {
                filter: body.filter,
                limit: body.limit,
                skip: body.skip,
                sort: body.sort,
                projection: body.projection
            } as FindQuery
        case DataOperations.Insert:
        case DataOperations.Update:
            return { item: body.item as Item }
        case DataOperations.BulkInsert:
        case DataOperations.BulkUpdate:
            return { items: body.items as Item[] }
        case DataOperations.Get:
            return { itemId: body.itemId, projection: body.projection }
        case DataOperations.Remove:
            return { itemId: body.itemId as string }
        case DataOperations.BulkRemove:
            return { itemIds: body.itemIds as string[] }
        case DataOperations.Aggregate:
            return {
                initialFilter: body.initialFilter,
                distinct: body.distinct,
                group: body.group,
                finalFilter: body.finalFilter,
                sort: body.sort,
                paging: body.paging,
            } as Partial<AggregateRequest>
        case DataOperations.Count:
            return { filter: body.filter as WixDataFilter }
    }
}

export const requestContextFor = (operation: any, body: any): RequestContext => ({ 
    operation, 
    collectionId: body.collectionId, 
    instanceId: body.requestContext.instanceId,
    memberId: body.requestContext.memberId,
    role: body.requestContext.role,
    settings: body.requestContext.settings
})
