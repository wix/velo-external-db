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
    pagingMode?: PagingMode; 
}

export interface Field {
    // Identifier of the field.
    key: string;
    // Type of the field.
    type: FieldType;
    // Defines what kind of operations this field supports.
    // Should be set by datasource itself and ignored in request payload.
    capabilities?: FieldCapabilities;
    typeOptions?: { singleReferenceOptions: SingleReferenceOptions }| { multiReferenceOptions: MultiReferenceOptions } ;
    encrypted?: boolean;
}

export interface SingleReferenceOptions {
    referencedCollectionId?: string;
    includeSupported?: boolean;
}

export interface MultiReferenceOptions {
    referencedCollectionId?: string;
    referencedCollectionFieldKey?: string;
    includeSupported: boolean
}
    
export interface FieldCapabilities {
    // Indicates if field can be used to sort items in collection. Defaults to false.
    sortable?: boolean;
    // Query operators (e.g. equals, less than) that can be used for this field.
    queryOperators?: QueryOperator[];
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


export interface CollectionCapabilities {
    // Lists data operations supported by collection.
    dataOperations: DataOperation[];
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
    date = 'DATE',
    dataTime = 'DATETIME',
    image = 'IMAGE',
    boolean = 'BOOLEAN',
    document = 'DOCUMENT',
    url = 'URL',
    richText = 'RICH_TEXT',
    video = 'VIDEO',
    any = 'ANY',
    arrayString = 'ARRAY_STRING',
    arrayDocument = 'ARRAY_DOCUMENT',
    audio = 'AUDIO',
    time = 'TIME',
    language = 'LANGUAGE',
    richContent = 'RICH_CONTENT',
    mediaGallery = 'MEDIA_GALLERY',
    address = 'ADDRESS',
    pageLink = 'PAGE_LINK',
    reference = 'REFERENCE',
    multiReference = 'MULTI_REFERENCE',
    object = 'OBJECT',
    array = 'ARRAY',

    // TODO: remove
    timestamp = 'TIMESTAMP',
    json = 'JSON',
    longText = 'LONG_TEXT',
    singleReference = 'SINGLE_REFERENCE',
}

export interface Permissions {
    // Lowest role needed to add a collection.
    insert: Role
    // Lowest role needed to update a collection.
    update: Role
    // Lowest role needed to update a collection.
    remove: Role
    // Lowest role needed to query a collection.
    read: Role
}

export enum Role {
    admin = 'ADMIN',
    siteMemberAuthor = 'SITE_MEMBER_AUTHOR',
    siteMember = 'SITE_MEMBER',
    anyone = 'ANYONE'
}

export enum PagingMode {
    offset = 'OFFSET',
    cursor = 'CURSOR',
}
