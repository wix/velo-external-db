


export abstract class CollectionService {
    abstract listCollections(req: ListCollectionsRequest): Promise<ListCollectionsResponsePart>
    abstract createCollection(req: CreateCollectionRequest): Promise<CreateCollectionResponse>
    abstract updateCollection(req: UpdateCollectionRequest): Promise<UpdateCollectionResponse>
    abstract deleteCollection(req: DeleteCollectionRequest): Promise<DeleteCollectionResponse>
}
export interface ListCollectionsRequest {
    collectionIds: string[];
}
export interface ListCollectionsResponsePart {
    collection?: Collection;
}
export interface DeleteCollectionRequest {
    collectionId?: string;
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
    id?: string;
    fields?: Field[];
    capabilities?: CollectionCapabilities;
}

export interface Field {
    key?: string;
    encrypted?: boolean;
    type?: FieldType;
    capabilities?: FieldCapabilities;
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
    sortable?: boolean;
    queryOperators?: QueryOperator[];
    singleReferenceOptions?: SingleReferenceOptions;
    multiReferenceOptions?: MultiReferenceOptions;
}

export enum QueryOperator {
    EQ = 0,
    LT = 1,
    GT = 2,
    NE = 3,
    LTE = 4,
    GTE = 5,
    STARTS_WITH = 6,
    ENDS_WITH = 7,
    CONTAINS = 8,
    HAS_SOME = 9,
    HAS_ALL = 10,
    EXISTS = 11,
    URLIZED = 12,
}
export interface SingleReferenceOptions {
    includeSupported?: boolean;
}
export interface MultiReferenceOptions {
    includeSupported?: boolean;
}

export interface CollectionCapabilities {
    dataOperations?: DataOperation[];
    fieldTypes?: FieldType[];
    referenceCapabilities?: ReferenceCapabilities;
    collectionOperations?: CollectionOperation[];
    indexing?: IndexingCapabilityEnum[];
    encryption?: Encryption;
}

export enum DataOperation {
    QUERY = 0,
    COUNT = 1,
    QUERY_REFERENCED = 2,
    AGGREGATE = 3,
    INSERT = 4,
    UPDATE = 5,
    REMOVE = 6,
    TRUNCATE = 7,
    INSERT_REFERENCES = 8,
    REMOVE_REFERENCES = 9,
}

export interface ReferenceCapabilities {
    supportedNamespaces?: string[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CollectionOperationEnum {
}

export enum CollectionOperation {
    UPDATE = 0,
    REMOVE = 1,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IndexingCapabilityEnum {
}

export enum IndexingCapability {
    LIST = 0,
    CREATE = 1,
    REMOVE = 2,
}

export enum Encryption {
    NOT_SUPPORTED = 0,
    WIX_DATA_NATIVE = 1,
    DATA_SOURCE_NATIVE = 2,
}
export enum FieldType {
    TEXT = 0,
    NUMBER = 1,
    BOOLEAN = 2,
    TIMESTAMP = 3,
    JSON = 4,
    LONG_TEXT = 5,
    SINGLE_REFERENCE = 6,
    MULTI_REFERENCE = 7,
}



