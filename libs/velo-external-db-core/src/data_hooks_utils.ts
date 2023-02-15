import { DataOperation } from '@wix-velo/velo-external-db-types'
import { AggregateRequest, CountRequest, InsertRequest, QueryRequest } from './spi-model/data_source'
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
                namespace: body.namespace, // not supported
                query: body.query,
                includeReferencedItems: body.includeReferencedItems, // not supported
                omitTotalCount: body.omitTotalCount,
                options: body.options // not supported
            } as QueryRequest
        case DataOperation.count:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                filter: body.filter,
                options: body.options // not supported
            } as CountRequest
        case DataOperation.aggregate:
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
                omitTotalCount: body.omitTotalCount,
                cursorPaging: body.cursorPaging, // not supported
            } as AggregateRequest

        case DataOperation.insert:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                items: body.items,
                overwriteExisting: body.overwriteExisting,
                options: body.options, // not supported
            } as InsertRequest
        case DataOperation.update:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                items: body.items,
                options: body.options, // not supported
            }
        case DataOperation.remove:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                itemIds: body.itemIds,
                options: body.options, // not supported
            }
        case DataOperation.truncate:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                options: body.options, // not supported
            }
        default:
            return {
                collectionId: body.collectionId,
                namespace: body.namespace, // not supported
                options: body.options, // not supported
            }
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
