

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


module.exports = { patchDateTime, unPatchDateTime }