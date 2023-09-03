import {  Item, RoleConfig, ItemWithId, DataOperation, CollectionOperationSPI } from '@wix-velo/velo-external-db-types'
import SchemaService from './service/schema'
import SchemaAwareDataService from './service/schema_aware_data'
import { AggregateRequest, CountRequest, CountResponse, InsertRequest, QueryRequest, UpdateRequest, RemoveRequest, TruncateRequest, QueryReferencedRequest, QueryResponse, InsertResponse, UpdateResponse, RemoveResponse, TruncateResponse, AggregateResponse } from './spi-model/data_source'
import { Collection, CreateCollectionRequest, DeleteCollectionRequest, ListCollectionsRequest, UpdateCollectionRequest } from './spi-model/collection'

// TODO: remove this comment in the end of the PR review
// export interface DataPayload {
//     collectionId: string;
//     filter?: WixDataFilter
//     sort?: Sort[] | Sorting[];
//     initialFilter?: WixDataFilter;
//     aggregation : Aggregation;
//     finalFilter?: WixDataFilter 
//     paging?: Paging;
//     items?: Item[];
//     itemIds?: string[];
//     options?: Options;
//     omitTotalCount?: boolean;
//     includeReferencedItems?: string[];
//     query?: QueryV2;
//     overwriteExisting?: boolean;
//     // totalCount its a count response field, why its here?
//     totalCount?: number;
// }

export type DataPayloadBefore = QueryRequest | CountRequest | QueryReferencedRequest | AggregateRequest | InsertRequest | UpdateRequest | RemoveRequest | TruncateRequest;

export type DataPayloadAfter = QueryResponse | CountResponse  | AggregateResponse | InsertResponse | UpdateResponse | RemoveResponse | TruncateResponse;


export interface SchemaPayload {
    collectionId?: string;
    collectionIds?: string[];
    collection?: Collection;
    collections?: Collection[];
}

export interface RequestContext {
    operation: DataOperation | CollectionOperationSPI
    collectionId?: string;
    collectionIds?: string[];
    metaSiteId: string;
}

export interface ServiceContext {
    dataService: SchemaAwareDataService;
    schemaService: SchemaService;
}


export type Hook<Payload> = 
    (payload: Payload, 
    requestContext: RequestContext, 
    serviceContext: ServiceContext, 
    customContext?: object) => (Promise<Payload> | Payload | void);

export interface DataHooks {
    beforeAll?: Hook<DataPayloadBefore>;
    afterAll?: Hook<DataPayloadAfter>;
    beforeRead?: Hook<DataPayloadBefore>;
    afterRead?: Hook<DataPayloadAfter>;
    beforeWrite?: Hook<DataPayloadBefore>;
    afterWrite?: Hook<DataPayloadAfter>;
    beforeQuery?: Hook<QueryRequest>
    afterQuery?: Hook<{ items: ItemWithId[], totalCount?: number }>
    beforeCount?: Hook<CountRequest>
    afterCount?: Hook<CountResponse>
    beforeAggregate?: Hook<AggregateRequest>
    afterAggregate?: Hook<{ items: ItemWithId[], totalCount?: number }>
    beforeInsert?: Hook<InsertRequest>
    afterInsert?: Hook<{ items: Item[] }>
    beforeUpdate?: Hook<UpdateRequest>
    afterUpdate?: Hook<{ items: Item[] }>
    beforeRemove?: Hook<RemoveRequest>
    afterRemove?: Hook<{ items: ItemWithId[] }>
    beforeTruncate?: Hook<TruncateRequest>
    afterTruncate?: Hook<void>
}

export type DataHook = DataHooks[keyof DataHooks];

export interface SchemaHooks {
    beforeAll?: Hook<SchemaPayload>;
    afterAll?: Hook<SchemaPayload>;
    beforeRead?: Hook<SchemaPayload>;
    afterRead?: Hook<SchemaPayload>;
    beforeWrite?: Hook<SchemaPayload>;
    afterWrite?: Hook<SchemaPayload>;
    beforeGet?: Hook<ListCollectionsRequest>;
    afterGet?: Hook<{ collections: Collection[] }>;
    beforeCreate?: Hook<CreateCollectionRequest>;
    afterCreate?: Hook<{ collection: Collection }>;
    beforeUpdate?: Hook<UpdateCollectionRequest>;
    afterUpdate?: Hook<{ collection: Collection }>;
    beforeDelete?: Hook<DeleteCollectionRequest>;
    afterDelete?: Hook<{ collection: Collection }>;
}

export interface ExternalDbRouterConfig {
    externalDatabaseId: string
    allowedMetasites: string
    authorization?: { roleConfig: RoleConfig }
    vendor?: string
    adapterType?: string
    commonExtended?: boolean
    hideAppInfo?: boolean
    wixDataBaseUrl: string
}

export type Hooks = {
    dataHooks?: DataHooks;
    schemaHooks?: SchemaHooks;
}
