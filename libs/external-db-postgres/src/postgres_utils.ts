
// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c

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
