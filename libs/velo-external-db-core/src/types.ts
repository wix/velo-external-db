import { AdapterFilter, InputField, Item, Sort, WixDataFilter } from "@wix-velo/velo-external-db-types";
import { AsWixSchema, AsWixSchemaHeaders } from "libs/velo-external-db-commons/src/libs/types";
import SchemaService from "./service/schema";
import SchemaAwareDataService from "./service/schema_aware_data";


export interface FindQuery {
    filter?: WixDataFilter;
    sort?: Sort;
    skip?: number;
    limit?: number;
}

export type AggregationQuery = {
    filter?: WixDataFilter,
    processingStep?: WixDataFilter,
    postProcessingStep?: WixDataFilter
}

export interface Payload {
    filter?: WixDataFilter | AdapterFilter
    sort?: Sort;
    skip?: number;
    limit?: number;
    postProcessingStep?: WixDataFilter | AdapterFilter;
    processingStep?: WixDataFilter | AdapterFilter;
    postFilteringStep?: WixDataFilter | AdapterFilter;
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


export type Hook<Payload> = (payload: Payload, requestContext: RequestContext, serviceContext: ServiceContext) => (Promise<Payload> | Payload | void);

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
    beforeAggregate?: Hook<AggregationQuery>
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
    beforeList?: Hook<{}>
    afterList?: Hook<{ schemas: AsWixSchema[] }>
    beforeListHeaders?: Hook<{}>
    afterListHeaders?: Hook<{ schemas: AsWixSchemaHeaders[] }>
    beforeFind?: Hook<string>
    afterFind?: Hook<{ schemas: AsWixSchema[] }>
    beforeCreate?: Hook<{ collectionName: string }>
    afterCreate?: Hook<{}>
    beforeColumnAdd?: Hook<{ column: InputField }>
    afterColumnAdd?: Hook<{}>
    beforeColumnRemove?: Hook<{ columnName: string }>
    afterColumnRemove?: Hook<{}>
}
