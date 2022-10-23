
// interface QueryRequest {
//     collectionId: string;
//     namespace?: string;
//     query: QueryV2;
//     includeReferencedItems: string[];
//     options: Options;
//     omitTotalCount: boolean;
// }

// interface QueryV2 {
//     filter: any;
//     sort?: Sorting;
//     fields: string[];
//     fieldsets: string[];
//     paging?: Paging;
//     cursorPaging?: CursorPaging;
// }

// interface Sorting {
//     fieldName: string;
//     order: SortOrder;
// }

// interface Paging {
//     limit: number;
//     offset: number;
// }

// interface CursorPaging {
//     limit: number;
//     cursor?: string;
// }

// interface Options {
//     consistentRead: string;
//     appOptions: any;
// }

// enum SortOrder {
//     ASC = 'ASC',
//     DESC = 'DESC'
// }

// interface QueryResponsePart {
//     item: any;
//     pagingMetadata: PagingMetadataV2
// }

// interface PagingMetadataV2 {
//     count?: number;
//     // Offset that was requested.
//     offset?: number;
//     // Total number of items that match the query. Returned if offset paging is used and the `tooManyToCount` flag is not set.
//     total?: number;
//     // Flag that indicates the server failed to calculate the `total` field.
//     tooManyToCount?: boolean
//     // Cursors to navigate through the result pages using `next` and `prev`. Returned if cursor paging is used.
//     cursors?: Cursors
//     // Indicates if there are more results after the current page.
//     // If `true`, another page of results can be retrieved.
//     // If `false`, this is the last page.
//     has_next?: boolean
// }

// interface Cursors {
//     next?: string;
//     // Cursor pointing to previous page in the list of results.
//     prev?: string;
// }

// interface CountRequest {
//     // collection name to query
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // query filter https://bo.wix.com/wix-docs/rnd/platformization-guidelines/api-query-language
//     filter?: any;
//     // request options
//     options: Options;
// }

// interface CountResponse {
//     total_count: number;
// }

// interface QueryReferencedRequest {
//     // collection name of referencing item
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // referencing item IDs
//     // NOTE if empty reads all referenced items
//     itemIds: string[];
//     // Multi-reference to read referenced items
//     referencePropertyName: string;
//     // Paging
//     paging: Paging;
//     cursorPaging: CursorPaging;
//     // Request options
//     options: Options;
//     // subset of properties to return
//     // empty means all, may not be supported
//     fields: string[]
//     // Indicates if total count calculation should be omitted.
//     // Only affects offset pagination, because cursor paging does not return total count.
//     omitTotalCount: boolean;
// }

// // Let's consider "Album" collection containing "songs" property which
// // contains references to "Song" collection.
// // When making references request to "Album" collection the following names are used:
// // - "Album" is called "referencing collection"
// // - "Album" items are called "referencing items"
// // - "Song" is called "referenced collection"
// // - "Song" items are called "referenced items"
// interface ReferencedItem {
//     // Requested collection item that references returned item
//     referencingItemId: string;
//     // Item from referenced collection that is referenced by referencing item
//     referencedItemId: string;
//     // may not be present if can't be resolved (not found or item is in draft state)
//     // if the only requested field is `_id` item will always be present with only field
//     item?: any;
//   }

// interface QueryReferencedResponsePart {
//     // overall result will contain single paging_metadata
//     // and zero or more items
//     item: ReferencedItem;
//     pagingMetadata: PagingMetadataV2;
// }

// interface AggregateRequest {
//     // collection name
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // filter to apply before aggregation
//     initialFilter?: any
//     // group and aggregate
//     // property name to return unique values of
//     // may unwind array values or not, depending on implementation
//     distinct: string;
//     group: Group;
//     // filter to apply after aggregation
//     final_filter?: any
//     // sorting
//     sort?: Sorting
//     // paging
//     paging?: Paging;
//     cursorPaging?: CursorPaging;
//     // request options
//     options: Options;
//     // Indicates if total count calculation should be omitted.
//     // Only affects offset pagination, because cursor paging does not return total count.
//     omitTotalCount: boolean;    
// }
  
// interface Group {
//     // properties to group by, if empty single group would be created
//     by: string[];
//     // aggregations, resulted group will contain field with given name and aggregation value
//     aggregation: Aggregation;
// }

// interface Aggregation {
//     // result property name
//     name: string;
//     // property to calculate average of
//     avg: string;
//     // property to calculate min of
//     min: string;
//     // property to calculate max of
//     max: string;
//     // property to calculate sum of
//     sum: string;
//     // count items, value is always 1
//     count: number;
// }

// interface AggregateResponsePart {
//     // query response consists of any number of items plus single paging metadata
//     // Aggregation result item.
//     // In case of group request, it should contain a field for each `group.by` value
//     // and a field for each `aggregation.name`.
//     // For example, grouping
//     // ```
//     // {by: ["foo", "bar"], aggregation: {name: "someCount", calculate: {count: "baz"}}}
//     // ```
//     // could produce an item:
//     // ```
//     // {foo: "xyz", bar: "456", someCount: 123}
//     // ```
//     // When `group.by` and 'aggregation.name' clash, grouping key should be returned.
//     //
//     // In case of distinct request, it should contain single field, for example
//     // ```
//     // {distinct: "foo"}
//     // ```
//     // could produce an item:
//     // ```
//     // {foo: "xyz"}
//     // ```
//     item?: any;
//     pagingMetadata?: PagingMetadataV2;
// }

// interface InsertRequest {
//     // collection name
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // Items to insert
//     items: any[];
//     // if true items would be overwritten by _id if present
//     overwriteExisting: boolean
//     // request options
//     options: Options;
// }

// interface InsertResponsePart {
//     item?: any;
//     // error from [errors list](errors.proto)
//     error: ApplicationError;
// }

// interface UpdateRequest {
//      // collection name
//      collectionId: string;
//      // Optional namespace assigned to collection/installation
//      namespace?: string;
//     // Items to update, must include _id
//     items: any[];
//     // request options
//     options: Options;
// }
  
// interface UpdateResponsePart {
//     // results in order of request
//     item?: any;
//     // error from [errors list](errors.proto)
//     error: ApplicationError;
// }

// interface RemoveRequest {
//     // collection name
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // Items to update, must include _id
//     itemIds: any[];
//     // request options
//     options: Options;
// }
  
// interface RemoveResponsePart {
//     // results in order of request
//     // results in order of request
//     item?: any;
//     // error from [errors list](errors.proto)
//     error: ApplicationError;
// }

// interface TruncateRequest {
//     // collection name
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // request options
//     options: Options;
// }
  
// interface TruncateResponse {}

// interface InsertReferencesRequest {
//     // collection name
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // multi-reference property to update
//     referencePropertyName: string;
//     // references to insert
//     references: ReferenceId[]
//     // request options
//     options: Options;
// }
  
// interface InsertReferencesResponsePart {
//     reference: ReferenceId;
//     // error from [errors list](errors.proto)
//     error: ApplicationError;
    
// }

// interface ReferenceId {
//     // Id of item in requested collection
//     referencingItemId: string;
//     // Id of item in referenced collection
//     referencedItemId: string;
// }

// interface RemoveReferencesRequest {
//     collectionId: string;
//     // Optional namespace assigned to collection/installation
//     namespace?: string;
//     // multi-reference property to update
//     referencePropertyName: string;
//     // reference masks to delete
//     referenceMasks: ReferenceMask[];
//     // request options
//     options: Options;
  
    
// }
  
// interface ReferenceMask {
//     // Referencing item ID or any item if empty
//     referencingItemId?: string;
//     // Referenced item ID or any item if empty
//     referencedItemId?: string;
// }

// interface RemoveReferencesResponse {}

// interface ApplicationError {
//     code: string;
//     description: string;
//     data: any;
// }
