export interface QueryRequest {
    collectionId: string;
    query: QueryV2;
    // Reference fields to include referenced items for
    // by default
    //  - single reference field is returned as referenced item ID
    //  - multiple reference field is not returned
    // May not be supported if references are not supported.
    // Included items SHOULD be sorted by reference creation date (which can be different from
    // referencing and referenced items creation date) in ascending order
    includeReferencedItems?: ReferencedItemToInclude[];
    consistentRead: boolean;
    // When `true`, response MUST include total count of items matching the query.
    returnTotalCount: boolean;
}

export interface QueryResponse {
    items: Item[];
    // TODO: implement CursorPaging type in the code
    pagingMetadata?: PagingMetadataV2;
}

export interface QueryV2 {
    filter: Filter;
    sort?: Sorting[];
    fields: string[];
    // TODO: implement CursorPaging type in the code
    paging: Paging;
}


// TODO: will be changed in references SPI implementation pr
export interface ReferencedItemToInclude {
    // Field in referencing collection
    fieldKey: string;
    // Max number of referenced items that should be returned
    limit: number;
}

export type Filter = {
    [fieldName: string]: any;
};

export interface Sorting {
    fieldName: string;
    order: SortOrder;
}

export interface Paging {
    limit: number;
    offset: number;
}

export interface CursorPaging {
    limit: number;
    cursor: string;
}

export interface Options {
    consistentRead: boolean;
    appOptions: any;
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}
export interface PagingMetadataV2 {
    // Will be implemented in the future
    count?: number;
    // Will be implemented in the future
    offset?: number;
    // Total number of items that match the query. Returned if offset paging is used and the `tooManyToCount` flag is not set.
    total?: number;
    // Cursors to navigate through the result pages using `next` and `prev`. Returned if cursor paging is used.
    cursors?: Cursors
}

export interface Cursors {
    next?: string;
    // Cursor pointing to previous page in the list of results.
    prev?: string;
}

export interface CountRequest {
    // collection name to query
    collectionId: string;
    // query filter https://bo.wix.com/wix-docs/rnd/platformization-guidelines/api-query-language
    filter?: Filter;
    // Indicates if the query should be strongly consistent in case data source works in eventually consistent mode.
    consistentRead: boolean;
}

export interface CountResponse {
    totalCount: number;
}

// TODO: will be changed in references SPI implementation pr
export interface QueryReferencedRequest {
    // collection name of referencing item
    collectionId: string;
    // Optional namespace assigned to collection/installation
    namespace?: string;
    // referencing item IDs
    // NOTE if empty reads all referenced items
    itemIds: string[];
    // Multi-reference to read referenced items
    referencePropertyName: string;
    // Paging
    paging: Paging;
    cursorPaging: CursorPaging;
    // Request options
    options: Options;
    // subset of properties to return
    // empty means all, may not be supported
    fields: string[]
    // Indicates if total count calculation should be omitted.
    // Only affects offset pagination, because cursor paging does not return total count.
    omitTotalCount: boolean;
}

// Let's consider "Album" collection containing "songs" property which
// contains references to "Song" collection.
// When making references request to "Album" collection the following names are used:
// - "Album" is called "referencing collection"
// - "Album" items are called "referencing items"
// - "Song" is called "referenced collection"
// - "Song" items are called "referenced items"
export interface ReferencedItem {
    // Requested collection item that references returned item
    referencingItemId: string;
    // Item from referenced collection that is referenced by referencing item
    referencedItemId: string;
    // may not be present if can't be resolved (not found or item is in draft state)
    // if the only requested field is `_id` item will always be present with only field
    item?: any;
  }

export interface QueryReferencedResponsePart {
    // overall result will contain single paging_metadata
    // and zero or more items
    item: ReferencedItem;
    pagingMetadata: PagingMetadataV2;
}

export interface AggregateRequest {
    // collection name
    collectionId: string;
    // filter to apply before aggregation
    initialFilter?: Filter;
    // Aggregation applied to the data.
    aggregation : Aggregation;
    // filter to apply after aggregation
    finalFilter?: Filter
    // sorting
    sort?: Sorting[]
    // Paging
    // TODO: implement CursorPaging type in the code
    paging: Paging;
    // Indicates if the query should be strongly consistent in case data source works in eventually consistent mode.
    // In other words, when a query is executed, it will always reflect the latest changes made to the data.
    // TODO: currently not supported, maybe it will be implemented in the future
    consistentRead: boolean;
    // When `true`, response MUST include total count of items matching the query.
    returnTotalCount: boolean; 
}

export interface AggregateResponse {
    items: Item[];
    // TODO: implement CursorPaging type in the code
    pagingMetadata?: PagingMetadataV2;
}

export interface Aggregation {
    // Fields by which to group items for the aggregation. If empty, result MUST contain a single group.
    groupingFields: string[];
    // Operations to carry out on the data in each grouping.
    operations: Operation[];
}
export interface InsertRequest {
    // collection name
    collectionId: string;
    // Items to insert
    items: any[];
}

export interface InsertResponse {
    // Either inserted item or error.
    results: DataItemModificationResult[];
}

// Item that was inserted, updated or removed. MUST be empty in case of error.
// Error indicating why operation failed for a particular item. MUST be empty in case of success.
export type DataItemModificationResult = { item: Item } | { error: ApplicationError };

export interface Item {
    [fieldName: string]: string | boolean;
};

export interface UpdateRequest {
     // collection name
     collectionId: string;
    // Items to update, must include _id
    items: Item[];
}

export interface UpdateResponse {
    results: DataItemModificationResult[];
}
export interface RemoveRequest {
    // collection name
    collectionId: string;
    // Optional namespace assigned to collection/installation
    itemIds: string[];
}
  
export interface RemoveResponse {
    results: DataItemModificationResult[];
}
export interface TruncateRequest {
    // collection name
    collectionId: string;
}
  
export interface TruncateResponse {}

// TODO: will be changed in references SPI implementation pr 
export interface InsertReferencesRequest {
    // collection name
    collectionId: string;
    // Optional namespace assigned to collection/installation
    namespace?: string;
    // multi-reference property to update
    referencePropertyName: string;
    // references to insert
    references: ReferenceId[]
    // request options
    options: Options;
}
  
// TODO: will be changed in references SPI implementation pr 
export interface InsertReferencesResponsePart {
    reference: ReferenceId;
    // error from [errors list](errors.proto)
    error: ApplicationError;
    
}

// TODO: will be changed in references SPI implementation pr 
export interface ReferenceId {
    // Id of item in requested collection
    referencingItemId: string;
    // Id of item in referenced collection
    referencedItemId: string;
}

// TODO: will be changed in references SPI implementation pr 
export interface RemoveReferencesRequest {
    collectionId: string;
    // Optional namespace assigned to collection/installation
    namespace?: string;
    // multi-reference property to update
    referencePropertyName: string;
    // reference masks to delete
    referenceMasks: ReferenceMask[];
    // request options
    options: Options;
  
    
}

// TODO: will be changed in references SPI implementation pr 
export interface ReferenceMask {
    // Referencing item ID or any item if empty
    referencingItemId?: string;
    // Referenced item ID or any item if empty
    referencedItemId?: string;
}

// TODO: will be changed in references SPI implementation pr 
export interface RemoveReferencesResponse {}

export interface ApplicationError {
    code: string;
    description: string;
    data?: any;
}

export type Operation = { resultFieldName: string } & Calculate;


export type Calculate = ({ max: CalculateItem; } & { [key in 'min' | 'sum' | 'average' | 'count']?: never }) | 
                        ({ min: CalculateItem; } & { [key in 'max' | 'sum' | 'average' | 'count']?: never }) |
                        ({ sum: CalculateItem; } & { [key in 'max' | 'min' | 'average' | 'count']?: never }) |
                        ({ average: CalculateItem; } & { [key in 'max' | 'min' | 'sum' | 'count']?: never }) |
                        // Record<string, never> is a TypeScript type that represents an empty object.
                        ({ count: Record<string, never>; } & { [key in 'max' | 'min' | 'sum' | 'average']?: never });


export type CalculateItem = { itemFieldName: string }

