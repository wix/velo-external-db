import {  RoleConfig, DataOperation, CollectionOperationSPI } from '@wix-velo/velo-external-db-types'
import SchemaService from './service/schema'
import SchemaAwareDataService from './service/schema_aware_data'
import { AggregateRequest, CountRequest, CountResponse, InsertRequest, QueryRequest, UpdateRequest, RemoveRequest, TruncateRequest, QueryReferencedRequest, QueryResponse, InsertResponse, UpdateResponse, RemoveResponse, TruncateResponse, AggregateResponse } from './spi-model/data_source'

import { Collection, CreateCollectionRequest, DeleteCollectionRequest, ListCollectionsRequest, UpdateCollectionRequest } from './spi-model/collection'

// those types are used by the app data hooks
export * from './spi-model/data_source'

export type DataPayloadBefore = QueryRequest | CountRequest | QueryReferencedRequest | AggregateRequest | InsertRequest | UpdateRequest | RemoveRequest | TruncateRequest;

export type DataPayloadAfter = QueryResponse | CountResponse  | AggregateResponse | InsertResponse | UpdateResponse | RemoveResponse | TruncateResponse;


export interface SchemaPayload {
    collectionId?: string;
    collectionIds?: string[];
    collection?: Collection;
    collections?: Collection[];
}

export interface Metadata {
    requestId: string,
    instanceId: string,
    identity: Identity,    
}

export type IdentityType = 'WIX_USER' | 'ANONYMOUS_VISITOR' | 'MEMBER' | 'APP'

export interface Identity { 
    identityType?: IdentityType,
    wixUserId?: string,
    anonymousVisitorId?: string,
    memberId?: string,
    appId?: string,
}

export interface RequestContext {
    operation: DataOperation | CollectionOperationSPI
    collectionId?: string;
    collectionIds?: string[];
    metadata: Metadata
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
    afterQuery?: Hook<QueryResponse>
    beforeCount?: Hook<CountRequest>
    afterCount?: Hook<CountResponse>
    beforeAggregate?: Hook<AggregateRequest>
    afterAggregate?: Hook<AggregateResponse>
    beforeInsert?: Hook<InsertRequest>
    afterInsert?: Hook<InsertResponse>
    beforeUpdate?: Hook<UpdateRequest>
    afterUpdate?: Hook<UpdateResponse>
    beforeRemove?: Hook<RemoveRequest>
    afterRemove?: Hook<RemoveResponse>
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
    authorization?: { roleConfig: RoleConfig }
    vendor?: string
    adapterType?: string
    commonExtended?: boolean
    hideAppInfo?: boolean
    readOnlySchema?: boolean
    jwtPublicKey: string
    appDefId: string
}

export type Hooks = {
    dataHooks?: DataHooks;
    schemaHooks?: SchemaHooks;
}
