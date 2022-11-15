import { AdapterFilter, InputField, Item, Sort, WixDataFilter, AsWixSchema, AsWixSchemaHeaders, RoleConfig } from '@wix-velo/velo-external-db-types'
import SchemaService from './service/schema'
import SchemaAwareDataService from './service/schema_aware_data'
import { AggregateRequest, Group, Paging, Sorting } from './spi-model/data_source';


export interface FindQuery {
    filter?: WixDataFilter;
    sort?: Sort;
    skip?: number;
    limit?: number;
}



export interface Payload {
    filter?: WixDataFilter | AdapterFilter
    sort?: Sort[] | Sorting[];
    skip?: number;
    limit?: number;
    initialFilter: WixDataFilter | AdapterFilter;
    group?: Group;
    finalFilter?: WixDataFilter | AdapterFilter;
    paging?: Paging;
    item?: Item;
    items?: Item[];
    itemId?: string;
    itemIds?: string[];
}

enum ReadOperation {
    GET = 'GET',
    FIND = 'FIND',
}

enum WriteOperation {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}

type Operation = ReadOperation | WriteOperation;

export interface RequestContext {
    operation: Operation;
    collectionName: string;
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
    beforeFind?: Hook<FindQuery>
    afterFind?: Hook<{ items: Item[] }>
    beforeInsert?: Hook<{ item: Item }>
    afterInsert?: Hook<{ item: Item }>
    beforeBulkInsert?: Hook<{ items: Item[] }>
    afterBulkInsert?: Hook<{ items: Item[] }>
    beforeUpdate?: Hook<{ item: Item }>
    afterUpdate?: Hook<{ item: Item }>
    beforeBulkUpdate?: Hook<{ items: Item[] }>
    afterBulkUpdate?: Hook<{ items: Item[] }>
    beforeRemove?: Hook<{ itemId: string }>
    afterRemove?: Hook<{ itemId: string }>
    beforeBulkRemove?: Hook<{ itemIds: string[] }>
    afterBulkRemove?: Hook<{ itemIds: string[] }>
    beforeAggregate?: Hook<AggregateRequest>
    afterAggregate?: Hook<{ items: Item[] }>
    beforeCount?: Hook<WixDataFilter>
    afterCount?: Hook<{ totalCount: number }>
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
    secretKey: string
    authorization?: { roleConfig: RoleConfig }
    vendor?: string
    adapterType?: string
    commonExtended?: boolean
    hideAppInfo?: boolean
}

export type Hooks = {
    dataHooks?: DataHooks;
    schemaHooks?: SchemaHooks;
}
