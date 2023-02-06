import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { CollectionOperation, DataOperation, FieldType } from '@wix-velo/velo-external-db-types'

const { query, count, queryReferenced, aggregate, } = DataOperation
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const ReadWriteOperations = Object.values(DataOperation)
export const ReadOnlyOperations = [query, count, queryReferenced, aggregate]
export const FieldTypes = Object.values(FieldType)
export const CollectionOperations = Object.values(CollectionOperation)
export const ColumnsCapabilities = {
    text: { sortable: true, columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte] },
    url: { sortable: true, columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte] },
    number: { sortable: true, columnQueryOperators: [eq, ne, gt, gte, lt, lte, include] },
    boolean: { sortable: true, columnQueryOperators: [eq] },
    image: { sortable: false, columnQueryOperators: [] },
    object: { sortable: false, columnQueryOperators: [] },
    datetime: { sortable: true, columnQueryOperators: [eq, ne, gt, gte, lt, lte] },
}
