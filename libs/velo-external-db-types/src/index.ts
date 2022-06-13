enum AdapterOperator { //in velo-external-db-core
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

enum SchemaOperations { //in schema_commons as well
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

type AdapterFilter = {
    operator: AdapterOperator,
    fieldName: string,
    value: any
}

type Sort = {
    fieldName: string,
    direction?: 'asc' | 'desc'
}

type Item = {
    [key: string]: any
    _id?: string,
    _owner?: string,
    _created_date?: string,
    _updated_date?: string,
}

type AdapterAggregation = {
    projection: string[],
    postFilter: AdapterFilter,
}

interface IDataProvider {
    find(collectionName: string, filter: AdapterFilter, sort: Sort, skip: number, limit: number, projection: string[]): Promise<Item[]>;
    count(collectionName: string, filter: AdapterFilter): Promise<number>;
    insert(collectionName: string, items: Item[]): Promise<number>;
    update(collectionName: string, items: Item[]): Promise<number>;
    delete(collectionName: string, itemIds: string[]): Promise<number>;
    truncate(collectionName: string): Promise<void>;
    aggregate(collectionName: string, filter: AdapterFilter, aggregation: AdapterAggregation): Promise<Item[]>;
}

type TableHeader = {
    id: string
}
type Table = TableHeader & { fields: InputField[] | ResponseField[] }

type FieldAttributes = {
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}


type InputField = FieldAttributes & { name: string }

type ResponseField = FieldAttributes & { field: string }

interface ISchemaProvider {
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

interface IBaseHttpError extends Error {
    status: number;
}

type ValidateConnectionResult = {
    valid: boolean,
    error?: IBaseHttpError
}

interface IDatabaseOperations {
    validateConnection(): Promise<ValidateConnectionResult>
}

type DbProviders = {
    dataProvider: IDataProvider
    schemaProvider: ISchemaProvider
    databaseOperations: IDatabaseOperations
    connection: any
    cleanup(): void
}


export {
    IDataProvider, ISchemaProvider, DbProviders, IDatabaseOperations,
    AdapterOperator, AdapterFilter, Sort, Item, AdapterAggregation, SchemaOperations,
    TableHeader, Table, ResponseField, InputField, ValidateConnectionResult
}