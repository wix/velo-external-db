
// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
const escapeIdentifier = (str) => `\`${(str || '').replace(/"/g, '""')}\``
const wildCardWith = (n, char) => Array(n).fill(char, 0, n).join(', ')

const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

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
    return Object.keys(item).reduce((acc, key) => {
        const value = item[key]?.value
        
        if (isDate(value)) 
            acc[key] = new Date(value)
        
        else if (isNumber(item[key])) 
            acc[key] = item[key].toNumber()
        
        else 
            acc[key] = item[key]


        return acc
    }, {})
}

const isNumber = (value) => value !== null && value.toNumber
const isDate = (value) => reISO.test(value)

module.exports = { patchDateTime, unPatchDateTime, escapeIdentifier, wildCardWith }