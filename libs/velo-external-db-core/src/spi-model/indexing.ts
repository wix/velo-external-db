export interface Index {
    // Index name
    name: string;

    // Fields over which the index is defined
    fields: IndexField[];

    // Indicates current status of index
    status?: IndexStatus;

    // If true index will enforce that values in the field are unique in scope of a collection. Default is false.
    unique: boolean;

    // If true index will be case-insensitive. Default is false.
    caseInsensitive: boolean;

    // Contains details about failure reason when index is in *FAILED* status
    //  wix.api.ApplicationError failure = 8 [(wix.api.readOnly) = true];
    failure?: ApplicationError;
}

export enum IndexStatus {
    UNKNOWN = 0,
    BUILDING = 1,
    ACTIVE = 2,
    DROPPING = 3,
    DROPPED = 4,
    FAILED = 5,
    INVALID = 6
}

export interface IndexField {
    // Order determines how values are ordered in the index. This is important when
    // ordering and/or range querying by indexed fields.
    order: IndexFieldOrder;

    // The field path to index.
    path: string;
}

export enum IndexFieldOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

interface ApplicationError {
    code: string,
    description: string,
    data: any
}

export abstract class IndexingService {
    abstract List(req: ListIndexesRequest): Promise<ListIndexesResponse> //stream of Indexes
    abstract Create(req: CreateIndexRequest): Promise<CreateIndexResponse>
    abstract Remove(req: RemoveIndexRequest): Promise<RemoveIndexResponse>
}

export interface ListIndexesRequest {
    // collection to list indexes from
    dataCollectionId: string;
    // optional namespace assigned to collection/installation
    namespace?: string;
    // slower read but consistent with recent updates
    consistentRead: boolean;
}

export interface ListIndexesResponse {
    // stream of Indexes
    index: Index[];
}

export interface CreateIndexRequest {
    // collection to list indexes from
    dataCollectionId: string;
    // optional namespace assigned to collection/installation
    namespace?: string;
    // index definition
    index: Index;
}

export interface CreateIndexResponse {
    // created index and it's status
    index: Index;
}

export interface RemoveIndexRequest {
    // collection to delete index from
    dataCollectionId: string;
    // optional namespace assigned to collection/installation
    namespace?: string;
    // index name
    indexName: string;
}

export interface RemoveIndexResponse {}