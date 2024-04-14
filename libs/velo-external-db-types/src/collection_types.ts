export enum DataOperation {
    query = 'query',
    count = 'count',
    queryReferenced = 'queryReferenced',
    aggregate = 'aggregate',
    insert = 'insert',
    update = 'update',
    remove = 'remove',
    truncate = 'truncate',
    insertReferences = 'insertReferences',
    removeReferences = 'removeReferences',
}

export enum CollectionOperationSPI { // rename it
    Get = 'get',
    Create = 'create',
    Update = 'update',
    Delete = 'delete',
}

export enum FieldType {
    text = 'text',
    time = 'time',
    date = 'date',
    number = 'number',
    boolean = 'boolean',
    datetime = 'datetime',
    object = 'object',
    longText = 'longText',
    singleReference = 'singleReference',
    multiReference = 'multiReference',
}

export enum CollectionOperation {
    update = 'update',
    remove = 'remove',
}

// TODO: remove this type
export enum Encryption {
    notSupported = 'notSupported',
    wixDataNative = 'wixDataNative',
    dataSourceNative = 'dataSourceNative',
}

export enum PagingMode {
    offset = 'offset',
    cursor = 'cursor',
}

export type CollectionCapabilities = {
    dataOperations: DataOperation[],
    fieldTypes: FieldType[],
    referenceCapabilities: ReferenceCapabilities,
    collectionOperations: CollectionOperation[],
    indexing: IndexingCapabilityEnum[],
    encryption: Encryption,
    pagingMode: PagingMode,
}

export type ColumnCapabilities = {
    sortable: boolean,
    columnQueryOperators: string[],
}

export type FieldAttributes = {
    type: string,
    subtype?: string,
    precision?: number | string,
    isPrimary?: boolean,
}

export interface ReferenceCapabilities {
    supportedNamespaces: string[],
}

export interface IndexingCapabilityEnum {
}

export enum SchemaOperations {
    List = 'list',
    ListHeaders = 'listHeaders',
    Create = 'createCollection',
    Drop = 'dropCollection',
    AddColumn = 'addColumn',
    RemoveColumn = 'removeColumn',
    ChangeColumnType = 'changeColumnType',
    Describe = 'describeCollection',
    FindWithSort = 'findWithSort',
    Aggregate = 'aggregate',
    BulkDelete = 'bulkDelete',
    Truncate = 'truncate',
    UpdateImmediately = 'updateImmediately',
    DeleteImmediately = 'deleteImmediately',
    StartWithCaseSensitive = 'startWithCaseSensitive',
    StartWithCaseInsensitive = 'startWithCaseInsensitive',
    Projection = 'projection',
    FindObject = 'findObject',
    Matches = 'matches',
    NotOperator = 'not',
    IncludeOperator = 'include',
    FilterByEveryField = 'filterByEveryField',
    QueryNestedFields = 'queryNestedFields',
    NonAtomicBulkInsert = 'NonAtomicBulkInsert',
    AtomicBulkInsert = 'AtomicBulkInsert',
    PrimaryKey = 'PrimaryKey',
    Indexing = 'Indexing',
}

export type InputField = FieldAttributes & { name: string }

export type ResponseField = FieldAttributes & { 
    field: string
    capabilities?: {
        sortable: boolean
        columnQueryOperators: string[]
    }
}

export type Table = { 
    id: string,
    fields: ResponseField[]
    capabilities?:  CollectionCapabilities
}
export interface ISchemaProvider {
    list(): Promise<Table[]>
    listHeaders(): Promise<string[]>
    supportedOperations(): SchemaOperations[]
    create(collectionName: string, columns?: InputField[]): Promise<void>
    addColumn(collectionName: string, column: InputField): Promise<void>
    removeColumn(collectionName: string, columnName: string): Promise<void>
    changeColumnType?(collectionName: string, column: InputField): Promise<void>
    describeCollection(collectionName: string): Promise<ResponseField[]> | Promise<Table>
    drop(collectionName: string): Promise<void>
    translateDbTypes?(column: InputField | ResponseField | string): ResponseField | string
    columnCapabilitiesFor?(columnType: string): ColumnCapabilities
    capabilities?(): CollectionCapabilities
}




