
// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
const escapeIdentifier = (str) => str === '*' ? '*' : `"${(str || '').replace(/"/g, '""')}"`

const prepareStatementVariables = (n) => {
    return Array.from({ length: n }, (_, i) => i + 1)
        .map(i => `$${i}`)
        .join(', ')
}


module.exports = { escapeIdentifier, prepareStatementVariables }