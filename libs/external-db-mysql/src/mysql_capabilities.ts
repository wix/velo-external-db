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
    truncate
} = DataOperation

export const ReadWriteOperations = Object.values(DataOperation)
export const ReadOnlyOperations = [query, count, queryReferenced, aggregate, truncate]
export const FieldTypes = Object.values(FieldType)
export const CollectionOperations = Object.values(CollectionOperation)
