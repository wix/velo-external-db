import {  Item, Sort, WixDataFilter, RoleConfig, ItemWithId, DataOperation, CollectionOperationSPI } from '@wix-velo/velo-external-db-types'
import SchemaService from './service/schema'
import SchemaAwareDataService from './service/schema_aware_data'
import { AggregateRequest, CountRequest, CountResponse, Group, InsertRequest, Paging, QueryRequest, Sorting, Options, QueryV2, UpdateRequest, RemoveRequest, TruncateRequest } from './spi-model/data_source'
import { Collection, CreateCollectionRequest, DeleteCollectionRequest, ListCollectionsRequest, UpdateCollectionRequest } from './spi-model/collection'

export interface DataPayload {
    collectionId: string;
    filter?: WixDataFilter
    sort?: Sort[] | Sorting[];
    initialFilter?: WixDataFilter;
    group?: Group;
    finalFilter?: WixDataFilter 
    paging?: Paging;
    items?: Item[];
    itemIds?: string[];
    options?: Options;
    omitTotalCount?: boolean;
    includeReferencedItems?: string[];
    namespace?: string;
    query?: QueryV2;
    overwriteExisting?: boolean;
    totalCount?: number;
}

export interface SchemaPayload {
    collectionId?: string;
    collectionIds?: string[];
    collection?: Collection;
    collections?: Collection[];
}

export interface RequestContext {
    operation: DataOperation | CollectionOperationSPI
    collectionId: string;
    instanceId?: string;
    role?: string;
    memberId?: string;
    settings?: any;
}

export interface ServiceContext {
    dataService: SchemaAwareDataService;
    schemaService: SchemaService;
}


export type Hook<Payload> = (payload: Payload, requestContext: RequestContext, serviceContext: ServiceContext, customContext?: object) => (Promise<Payload> | Payload | void);

export interface DataHooks {
    beforeAll?: Hook<DataPayload>;
    afterAll?: Hook<DataPayload>;
    beforeRead?: Hook<DataPayload>;
    afterRead?: Hook<DataPayload>;
    beforeWrite?: Hook<DataPayload>;
    afterWrite?: Hook<DataPayload>;
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
