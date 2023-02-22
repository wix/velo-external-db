import { InputField, Item, Sort, WixDataFilter, AsWixSchema, AsWixSchemaHeaders, RoleConfig, ItemWithId, DataOperation } from '@wix-velo/velo-external-db-types'
import SchemaService from './service/schema'
import SchemaAwareDataService from './service/schema_aware_data'
import { AggregateRequest, CountRequest, CountResponse, Group, InsertRequest, Paging, QueryRequest, Sorting, Options, QueryV2, UpdateRequest, RemoveRequest, TruncateRequest } from './spi-model/data_source'


export interface Payload {
    filter?: WixDataFilter
    sort?: Sort[] | Sorting[];
    initialFilter?: WixDataFilter;
    group?: Group;
    finalFilter?: WixDataFilter 
    paging?: Paging;
    items?: Item[];
    itemIds?: string[];
    collectionId: string;
    options?: Options;
    omitTotalCount?: boolean;
    includeReferencedItems?: string[];
    namespace?: string;
    query?: QueryV2;
    overwriteExisting?: boolean;
    totalCount?: number;
}

export interface RequestContext {
    operation: DataOperation // | SchemaOperation
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
    beforeAll?: Hook<Payload>;
    afterAll?: Hook<Payload>;
    beforeRead?: Hook<Payload>;
    afterRead?: Hook<Payload>;
    beforeWrite?: Hook<Payload>;
    afterWrite?: Hook<Payload>;
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
    beforeAll?: Hook<Payload>;
    afterAll?: Hook<Payload>;
    beforeRead?: Hook<Payload>;
    afterRead?: Hook<Payload>;
    beforeWrite?: Hook<Payload>;
    afterWrite?: Hook<Payload>;
    beforeList?: Hook<Record<string, never>>
    afterList?: Hook<{ schemas: AsWixSchema[] }>
    beforeListHeaders?: Hook<Record<string, never>>
    afterListHeaders?: Hook<{ schemas: AsWixSchemaHeaders[] }>
    beforeFind?: Hook<string>
    afterFind?: Hook<{ schemas: AsWixSchema[] }>
    beforeCreate?: Hook<{ collectionName: string }>
    afterCreate?: Hook<Record<string, never>>
    beforeColumnAdd?: Hook<{ column: InputField }>
    afterColumnAdd?: Hook<Record<string, never>>
    beforeColumnRemove?: Hook<{ columnName: string }>
    afterColumnRemove?: Hook<Record<string, never>>
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
