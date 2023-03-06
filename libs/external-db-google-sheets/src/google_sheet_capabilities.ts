import {
    DataOperation,
    FieldType,
} from '@wix-velo/velo-external-db-types'

export const ColumnsCapabilities = {
    text: { sortable: false, columnQueryOperators: [] },
    url: { sortable: false, columnQueryOperators: [] },
    number: { sortable: false, columnQueryOperators: [] },
    boolean: { sortable: false, columnQueryOperators: [] },
    image: { sortable: false, columnQueryOperators: [] },
    object: { sortable: false, columnQueryOperators: [] },
    datetime: { sortable: false, columnQueryOperators: [] },
}

export const ReadWriteOperations = [
    DataOperation.insert,
    DataOperation.update,
    DataOperation.remove,
    DataOperation.truncate,
]
export const ReadOnlyOperations = []
export const FieldTypes = [ FieldType.text ]
export const CollectionOperations = []
