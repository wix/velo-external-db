
// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
const escapeIdentifier = (str) => `"${(str || '').replace(/"/g, '""')}"`


module.exports = { escapeIdentifier }