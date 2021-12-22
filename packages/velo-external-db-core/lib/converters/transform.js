const { v4: uuidv4 } = require('uuid')
let dateTimeProvider = require('../utils/date_time_provider')

const asWixData = e => packDates(e)

const isObject = (o) => typeof o === 'object' && o !== null


const unpackDates = item => {
    const i = clone(item)

    Object.keys(i)
          .forEach(key => {
              const value = item[key]
              if (isObject(value) && '$date' in value) {
                  i[key] = new Date(value['$date'])
              }
          })

    return i
}

const generateIdsIfNeeded = item => {
    if ('_id' in item) {
        return item
    }
    return { ...item, _id: uuidv4() }
}

const defaultValueFor = (f) => {
    switch (f.type) {
        case 'number':
            switch (f.subtype) {
                case 'int':
                case 'bigint':
                    return 0
                case 'float':
                case 'double':
                case 'decimal':
                    return 0.0
            }
            return 0  // default for number is 0 
        case 'text':
            return f.isPrimary ? uuidv4() : ''
        case 'datetime':
            return dateTimeProvider.currentDateTime()
        case 'boolean':
            return false
    }
}

const prepareForInsert = (item, fields) => fields.reduce((pv, f) => ({ ...pv, [f.field]: item[f.field] || defaultValueFor(f) }), {})
const prepareForUpdate = (item, fields) => fields.reduce((pv, f) => f.field in item ? ({ ...pv, [f.field]: item[f.field] }) : pv, {})

const clone = o => ({ ...o })

const isDate = d => {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/
    return d instanceof Date || Object.prototype.toString.call(d) === '[object Date]' || (typeof d === 'string' && reISO.test(d))
}

const packDates = item => Object.entries(item)
                                .reduce((o, [k, v]) => ( { ...o, [k]: isDate(v) ? { $date: v.toISOString() } : v } ), { } )

const transformIfSupported = (filter, transformer) => transformer? transformer.transform(filter) : filter

module.exports = { asWixData, unpackDates, generateIdsIfNeeded, defaultValueFor, isDate, prepareForInsert, prepareForUpdate, transformIfSupported }