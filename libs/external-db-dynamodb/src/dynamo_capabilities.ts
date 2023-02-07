import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { CollectionOperation, DataOperation, FieldType } from '@wix-velo/velo-external-db-types'

const { eq, ne, string_contains, string_begins, gt, gte, lt, lte, include } = AdapterOperators
const UnsupportedCapabilities = [DataOperation.insertReferences, DataOperation.removeReferences, DataOperation.queryReferenced]


export const ReadWriteOperations = Object.values(DataOperation).filter(op => !UnsupportedCapabilities.includes(op))

export const FieldTypes = Object.values(FieldType)
export const CollectionOperations = Object.values(CollectionOperation)
export const ColumnsCapabilities = {
    text: { sortable: false, columnQueryOperators: [eq, ne, string_contains, string_begins, include, gt, gte, lt, lte] },
    url: { sortable: false, columnQueryOperators: [eq, ne, string_contains, string_begins, include, gt, gte, lt, lte] },
    number: { sortable: false, columnQueryOperators: [eq, ne, gt, gte, lt, lte, include] },
    boolean: { sortable: false, columnQueryOperators: [eq] },
    image: { sortable: false, columnQueryOperators: [] },
    object: { sortable: false, columnQueryOperators: [eq, ne, string_contains, string_begins, include, gt, gte, lt, lte] },
    datetime: { sortable: false, columnQueryOperators: [eq, ne, gt, gte, lt, lte] },
}
