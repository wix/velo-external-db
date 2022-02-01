
const { v4: uuidv4 } = require('uuid')
const { isObject } = require('velo-external-db-commons')
let dateTimeProvider = require('../utils/date_time_provider')

class ItemPatcher {
    constructor() {
    }
    
    prepareItemsForInsert(items, fields) {
        return items.map(i => this.prepareForInsert(i, fields))
    }

    prepareItemsForUpdate(items, fields) {
        return items.map(i => this.prepareForUpdate(i, fields))
    }

    prepareForInsert(item, fields) {        
        return this.unpackDates(fields.reduce((pv, f) => ({ ...pv, [f.field]: item[f.field] || this.defaultValueFor(f) }), {}))
    }

    prepareForUpdate(item, fields) {
         return this.unpackDates(fields.reduce((pv, f) => f.field in item ? ({ ...pv, [f.field]: item[f.field] }) : pv, {}))
    }
    
    defaultValueFor(f) {
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

    unpackDates(item) {
        const i = { ...item }
    
        Object.keys(i)
              .forEach(key => {
                const value = item[key]
                if (isObject(value) && '$date' in value) {
                    i[key] = new Date(value['$date'])
                }
            })
    
        return i
    }
    
}

module.exports = ItemPatcher