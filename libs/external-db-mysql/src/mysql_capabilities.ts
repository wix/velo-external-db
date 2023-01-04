import {
    CollectionOperation,
    DataOperation,
    FieldType,
} from '@wix-velo/velo-external-db-types'

const {
    query,
    count,
    queryReferenced,
    aggregate,
} = DataOperation

export const ReadWriteOperations = Object.values(DataOperation)
export const ReadOnlyOperations = [query, count, queryReferenced, aggregate]
export const FieldTypes = Object.values(FieldType)
export const CollectionOperations = Object.values(CollectionOperation)
