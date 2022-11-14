


export type listCollections = (req: ListCollectionsRequest) => Promise<ListCollectionsResponsePart>
export type createCollection = (req: CreateCollectionRequest) => Promise<CreateCollectionResponse>
export type updateCollection = (req: UpdateCollectionRequest) => Promise<UpdateCollectionResponse>
export type deleteCollection = (req: DeleteCollectionRequest) => Promise<DeleteCollectionResponse>
export abstract class CollectionService {
}
export interface ListCollectionsRequest {
    collectionIds: string[];
}
export interface ListCollectionsResponsePart {
    collection?: Collection[];
}
export interface DeleteCollectionRequest {
    collectionId: string;
}
export interface DeleteCollectionResponse {
    collection?: Collection;
}
export interface CreateCollectionRequest {
    collection?: Collection;
}
export interface CreateCollectionResponse {
    collection?: Collection;
}
export interface UpdateCollectionRequest {
    collection?: Collection;
}
export interface UpdateCollectionResponse {
    collection?: Collection;
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
    sortable: boolean;
    // Query operators (e.g. equals, less than) that can be used for this field.
    queryOperators: QueryOperator[];
    singleReferenceOptions?: SingleReferenceOptions;
    multiReferenceOptions?: MultiReferenceOptions;
}

export enum QueryOperator {
    eq = 0,
    lt = 1,
    gt = 2,
    ne = 3,
    lte = 4,
    gte = 5,
    startsWith = 6,
    endsWith = 7,
    contains = 8,
    hasSome = 9,
    hasAll = 10,
    exists = 11,
    urlized = 12,
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
    referenceCapabilities?: ReferenceCapabilities;
    // Lists what kind of modifications this collection accept.
    collectionOperations: CollectionOperation[];
    // Defines which indexing operations is supported.
    indexing?: IndexingCapabilityEnum[];
    // Defines if/how encryption is supported.
    encryption?: Encryption;
}

export enum DataOperation {
    query = 0,
    count = 1,
    queryReferenced = 2,
    aggregate = 3,
    insert = 4,
    update = 5,
    remove = 6,
    truncate = 7,
    insertReferences = 8,
    removeReferences = 9,
}

export interface ReferenceCapabilities {
    supportedNamespaces?: string[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CollectionOperationEnum {
}

export enum CollectionOperation {
    update = 0,
    remove = 1,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IndexingCapabilityEnum {
}

export enum IndexingCapability {
    list = 0,
    create = 1,
    remove = 2,
}

export enum Encryption {
    notSupported = 0,
    wixDataNative = 1,
    dataSourceNative = 2,
}
export enum FieldType {
    text = 0,
    number = 1,
    boolean = 2,
    datetime = 3,
    object = 4,
    longText = 5,
    singleReference = 6,
    multiReference = 7,
}



