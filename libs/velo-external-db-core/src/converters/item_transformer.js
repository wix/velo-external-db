const { v4: uuidv4 } = require('uuid')
let dateTimeProvider = require('../utils/date_time_provider')

const isObject = (o) => typeof o === 'object' && o !== null

class ItemTransformer {
    constructor() {
    }
    
    prepareItemsForInsert(items, fields) {
        return items.map(i => this.prepareForInsert(i, fields))
    }

    prepareForInsert(item, fields) {        
        return this.unpackDates(fields.reduce((pv, f) => ({ ...pv, [f.field]: item[f.field] || this.defaultValueFor(f) }), {}))
    }

    
    patchItemsBooleanFields(items, fields) { 
        return items.map(i => this.patchBoolean(i, fields.filter(f => f.type === 'boolean')))
    }

    patchItems(items, fields) {
        const patchedBooleanItems = items.map(i => this.patchBoolean(i, fields.filter(f => f.type === 'boolean')))
        const patchedObjectItems = patchedBooleanItems.map(i => this.patchObject(i, fields.filter(f => f.type === 'object')))
        return patchedObjectItems
    }

    patchObject(item, fields) {
        const patchedItem = { ...item }

        fields.forEach(({ field, type }) => {
            if (type === 'object' && typeof(patchedItem[field]) !== 'object' ) {
                try {
                    patchedItem[field] = JSON.parse(patchedItem[field])
                } catch (e) {
                    console.error(e)
                }
            }
        })

        return patchedItem 
    }

    patchBoolean(item, fields) {
        const i = { ...item }
    
        fields.forEach(f => {
            if (f.field in i) {
                i[f.field] = this.booleanValueFor(i[f.field])
            }
        })
        return i
    }

    booleanValueFor(value) {
        switch (value) {
            case 'true':
            case '1':
            case 1:
                return true
            case 'false':
            case '0':
            case 0:
                return false
            default: 
                return value
        }
    }
    defaultValueFor(f) {
        switch (f.type) {
            case 'text':
                return f.isPrimary || f.field ==='_id' ? uuidv4() : null
            case 'datetime':
                return f.field === '_createdDate' || f.field === '_updatedDate' ? dateTimeProvider.currentDateTime() : null
            default:
                return null
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

module.exports = ItemTransformer
