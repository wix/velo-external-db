export enum AdapterOperator { //in velo-external-db-core
    eq = 'eq',
    gt = 'gt',
    gte = 'gte',
    include = 'in',
    lt = 'lt',
    lte = 'lte',
    ne = 'ne',
    string_begins = 'begins',
    string_ends = 'ends',
    string_contains = 'contains',
    and = 'and',
    or = 'or',
    not = 'not',
    urlized = 'urlized',
    matches = 'matches'
}

export enum SchemaOperations { //in schema_commons as well
    List = 'list',
    ListHeaders = 'listHeaders',
    Create = 'createCollection',
    Drop = 'dropCollection',
    AddColumn = 'addColumn',
    RemoveColumn = 'removeColumn',
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
}
export type AnyFixMe = any

export type AdapterFilter = {
    operator: AdapterOperator,
    fieldName: string,
    value: any
}

export type Sort = {
    fieldName: string,
    direction?: 'asc' | 'desc'
}

export type Item = {
    [key: string]: any
    _id?: string,
    _owner?: string,
    _created_date?: string,
    _updated_date?: string,
}

export type ItemWithId = { _id: string } & Item

export type AdapterAggregation = {
    projection: string[],
    postFilter: AdapterFilter,
}

export interface IDataProvider {
    find(collectionName: string, filter: AdapterFilter, sort: Sort, skip: number, limit: number, projection: string[]): Promise<Item[]>;
    count(collectionName: string, filter: AdapterFilter): Promise<number>;
    insert(collectionName: string, items: Item[]): Promise<number>;
    update(collectionName: string, items: Item[]): Promise<number>;
    delete(collectionName: string, itemIds: string[]): Promise<number>;
    truncate(collectionName: string): Promise<void>;
    aggregate(collectionName: string, filter: AdapterFilter, aggregation: AdapterAggregation): Promise<Item[]>;
}

export type TableHeader = {
    id: string
}

export type Table = TableHeader & { fields: ResponseField[] }

export type FieldAttributes = {
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}

export type InputField = FieldAttributes & { name: string }

export type ResponseField = FieldAttributes & { field: string }

export interface ISchemaProvider {
    list(): Promise<Table[]>
    listHeaders(): Promise<TableHeader[]>
    supportedOperations(): SchemaOperations[]
    create(collectionName: string, columns: InputField[]): Promise<void>
    addColumn(collectionName: string, column: InputField): Promise<void>
    removeColumn(collectionName: string, columnName: string): Promise<void>
    describeCollection(collectionName: string): Promise<ResponseField[]>
    drop(collectionName: string): Promise<void>
    translateDbTypes?(column: InputField): ResponseField
}

export interface IBaseHttpError extends Error {
    status: number;
}

export type ValidateConnectionResult = {
    valid: boolean,
    error?: IBaseHttpError
}

export interface IDatabaseOperations {
    validateConnection(): Promise<ValidateConnectionResult>
}

export type ConnectionCleanUp = () => Promise<void> | void

export type DbProviders<T> = {
    dataProvider: IDataProvider
    schemaProvider: ISchemaProvider
    databaseOperations: IDatabaseOperations
    connection: T
    cleanup: ConnectionCleanUp
}

export interface IConfigValidator {
    validate(config: any): { missingRequiredSecretsKeys: string[] }
    readConfig(): any
}
