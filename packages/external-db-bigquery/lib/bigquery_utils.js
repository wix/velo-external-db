const { SchemaOperations } = require('velo-external-db-commons')
const { LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION } = SchemaOperations

const schemaSupportedOperations =  [LIST, LIST_HEADERS, CREATE, DROP, ADD_COLUMN, REMOVE_COLUMN, DESCRIBE_COLLECTION]

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
const escapeIdentifier = (str) => `\`${(str || '').replace(/"/g, '""')}\``
const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

const patchDateTime = (item) => {
    const obj = {}
    for (const key of Object.keys(item)) {
        const value = item[key]
        
        if (value instanceof Date) {
            obj[key] = value.toISOString()
        } else {
            obj[key] = item[key]
        }
    }
    return obj
}


const unPatchDateTime = (item) => {
    const obj = {}
    for (const key of Object.keys(item)) {
        const value = item[key].value
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

        if (reISO.test(value)) {
            obj[key] = new Date(value)
        } else {
            obj[key] = item[key].toNumber ? item[key].toNumber() : item[key]
        }
    }

    return obj
}


module.exports = { patchDateTime, unPatchDateTime, escapeIdentifier, wildCardWith, schemaSupportedOperations }