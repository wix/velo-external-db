
// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
import { DomainIndex, DomainIndexStatus } from '@wix-velo/velo-external-db-types'

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


export const extractIndexFromIndexQueryForCollection = (query: string): DomainIndex => {
    const isUnique = query.includes('UNIQUE')
    const name = query.split('INDEX')[1].split('ON')[0].trim()
    const columns = query.split('ON')[1].split('(')[1].split(')')[0].split(',').map(c => c.trim())
    return {
        name,
        columns,
        isUnique,
        caseInsensitive: true,
        order: 'ASC',
        status: DomainIndexStatus.BUILDING
    }
}
