export type listCollections = (req: ListCollectionsRequest) => Promise<ListCollectionsResponsePart[]>

export type createCollection = (req: CreateCollectionRequest) => Promise<CreateCollectionResponse>

export type updateCollection = (req: UpdateCollectionRequest) => Promise<UpdateCollectionResponse>

export type deleteCollection = (req: DeleteCollectionRequest) => Promise<DeleteCollectionResponse>
export abstract class CollectionService {
}
export interface ListCollectionsRequest {
    collectionIds: string[];
}
export interface ListCollectionsResponsePart {
    collection: Collection;
}
export interface DeleteCollectionRequest {
    collectionId: string;
}
export interface DeleteCollectionResponse {
    collection: Collection;
}
export interface CreateCollectionRequest {
    collection: Collection;
}
export interface CreateCollectionResponse {
    collection: Collection;
}
export interface UpdateCollectionRequest {
    collection: Collection;
}
export interface UpdateCollectionResponse {
    collection: Collection;
}
export interface Collection {
    id: string;
    fields: Field[];
    capabilities?: CollectionCapabilities;
}

export interface Field {
    // Identifier of the field.
    key: string;
    // Value is encrypted when `true`. Global data source capabilities define where encryption takes place.
    encrypted?: boolean;
    // Type of the field.
    type: FieldType;
    // Defines what kind of operations this field supports.
    // Should be set by datasource itself and ignored in request payload.
    capabilities?: FieldCapabilities;
    // Additional options for specific field types, should be one of the following
    singleReferenceOptions?: SingleReferenceOptions;
    multiReferenceOptions?: MultiReferenceOptions;
}

export interface SingleReferenceOptions {
    referencedCollectionId?: string;
    referencedNamespace?: string;
}
export interface MultiReferenceOptions {
    referencedCollectionId?: string;
    referencedNamespace?: string;
    referencingFieldKey?: string;
}
    
export interface FieldCapabilities {
    // Indicates if field can be used to sort items in collection. Defaults to false.
    sortable?: boolean;
    // Query operators (e.g. equals, less than) that can be used for this field.
    queryOperators?: QueryOperator[];
    singleReferenceOptions?: SingleReferenceOptions;
    multiReferenceOptions?: MultiReferenceOptions;
}

export enum QueryOperator {
    eq = 'EQ',
    lt = 'LT',
    gt = 'GT',
    ne = 'NE',
    lte = 'LTE',
    gte = 'GTE',
    startsWith = 'STARTS_WITH',
    endsWith = 'ENDS_WITH',
    contains = 'CONTAINS',
    hasSome = 'HAS_SOME',
    hasAll = 'HAS_ALL',
    exists = 'EXISTS',
    urlized = 'URLIZED',
}
export interface SingleReferenceOptions {
    // `true` when datasource supports `include_referenced_items` in query method natively.
    includeSupported?: boolean;
}
export interface MultiReferenceOptions {
    // `true` when datasource supports `include_referenced_items` in query method natively.
    includeSupported?: boolean;
}

export interface CollectionCapabilities {
    // Lists data operations supported by collection.
    dataOperations: DataOperation[];
    // Supported field types.
    fieldTypes: FieldType[];
    // Describes what kind of reference capabilities is supported.
    referenceCapabilities: ReferenceCapabilities;
    // Lists what kind of modifications this collection accept.
    collectionOperations: CollectionOperation[];
    // Defines which indexing operations is supported.
    indexing: IndexingCapabilityEnum[];
    // Defines if/how encryption is supported.
    encryption: Encryption;
}

export enum DataOperation {
    query = 'QUERY',
    count = 'COUNT',
    queryReferenced = 'QUERY_REFERENCED',
    aggregate = 'AGGREGATE',
    insert = 'INSERT',
    update = 'UPDATE',
    remove = 'REMOVE',
    truncate = 'TRUNCATE',
    insertReferences = 'INSERT_REFERENCES',
    removeReferences = 'REMOVE_REFERENCES',
}

export interface ReferenceCapabilities {
    supportedNamespaces?: string[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CollectionOperationEnum {
}

export enum CollectionOperation {
    update = 'UPDATE',
    remove = 'REMOVE',
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IndexingCapabilityEnum {
}

export enum IndexingCapability {
    list = 'LIST',
    create = 'CREATE',
    remove = 'REMOVE',
}

export enum Encryption {
    notSupported = 'NOT_SUPPORTED',
    wixDataNative = 'WIX_DATA_NATIVE',
    dataSourceNative = 'DATA_SOURCE_NATIVE',
}
export enum FieldType {
    text = 'TEXT',
    number = 'NUMBER',
    boolean = 'BOOLEAN',
    timestamp = 'TIMESTAMP',
    json = 'JSON',
    longText = 'LONG_TEXT',
    singleReference = 'SINGLE_REFERENCE',
    multiReference = 'MULTI_REFERENCE',
}
