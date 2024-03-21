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
    UNKNOWN = 'UNKNOWN',
    BUILDING = 'BUILDING',
    ACTIVE = 'ACTIVE',
    DROPPING = 'DROPPING',
    DROPPED = 'DROPPED',
    FAILED = 'FAILED',
    INVALID = 'INVALID'
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
    errorMessage: string,
    data: any
}

export interface ListIndexesRequest {
    collectionId: string;
}

export type ListIndexesResponse = {
    indexes: Index[];
}

export interface CreateIndexRequest {
    collectionId: string;
    index: Index;
}

export interface CreateIndexResponse {
    index: Index;
}

export interface RemoveIndexRequest {
    collectionId: string;
    indexName: string;
}

export interface RemoveIndexResponse {}
