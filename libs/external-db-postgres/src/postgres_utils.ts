
// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
import { ColumnCapabilities } from '@wix-velo/velo-external-db-types'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const escapeIdentifier = (str: string) => str === '*' ? '*' : `"${(str || '').replace(/"/g, '""')}"`

export const prepareStatementVariables = (n: number) => {
    return Array.from({ length: n }, (_, i) => i + 1)
        .map(i => `$${i}`)
        .join(', ')
}

export const prepareStatementVariablesForBulkInsert = (rowsCount: number, columnsCount: number) => {
    const segments = []
    for(let row=0; row < rowsCount; row++) {
        const segment = []
        for(let col=0; col < columnsCount; col++) {
            segment.push(`$${col+1 + row * columnsCount}`)
        }
        segments.push('(' + segment.join(',') + ')')
    }
    return segments.join(',')
}

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
                columnQueryOperators: [eq, ne]
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
