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

export enum FieldType {
    text = 'text',
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

export enum Encryption {
    notSupported = 'notSupported',
    wixDataNative = 'wixDataNative',
    dataSourceNative = 'dataSourceNative',
}

export type CollectionCapabilities = {
    dataOperations: DataOperation[],
    fieldTypes: FieldType[],
    collectionOperations: CollectionOperation[],
    encryption?: Encryption,
}

export type ColumnCapabilities = {
    sortable: boolean,
    columnQueryOperators: string[],
}



