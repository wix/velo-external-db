import { escapeId } from 'mysql'
import { errors, patchDateTime, AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { Item, ColumnCapabilities } from '@wix-velo/velo-external-db-types'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const wildCardWith = (n: number, char: string) => Array(n).fill(char, 0, n).join(', ')

export const escapeTable = (t: string) => {
    if(t && t.indexOf('.') !== -1) {
        throw new errors.InvalidQuery('Illegal table name')
    }
    return escapeId(t)
}

const escapeIdField = (f: string) => f === '*' ? '*' : escapeId(f)

const patchObjectField = (item: Item) => Object.entries(item).reduce((acc: {[key:string]: any}, [key, value]) => {
        acc[key] = (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value
        return acc
    }, {})


export const patchItem = (item: Item) => {
    const itemWithPatchedDateTime = patchDateTime(item)
    const itemWithPatchedObject = patchObjectField(itemWithPatchedDateTime)

    return itemWithPatchedObject
}

export { escapeIdField as escapeId }

export const columnCapabilitiesFor = (columnType: string): ColumnCapabilities => {
    switch (columnType) {
        case 'text':
        case 'url':
            return {
               sortable: true,
               columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte]
            }
        case 'number':
            return {
                sortable: true,
                columnQueryOperators: [eq, ne, gt, gte, lt, lte, include]
            }
        case 'boolean':
            return {
                sortable: true,
                columnQueryOperators: [eq]
            }
        case 'image':
            return {
                sortable: false,
                columnQueryOperators: []
            }
        case 'object':
            return {
                sortable: true,
                columnQueryOperators: [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte]
            }
        case 'datetime':
            return {
                sortable: true,
                columnQueryOperators: [eq, ne, gt, gte, lt, lte]
            }

        default:
            throw new Error(`${columnType} - Unsupported field type`)
    }
}
