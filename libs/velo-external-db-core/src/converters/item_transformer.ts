import { Item, ResponseField } from '@wix-velo/velo-external-db-types'
import { v4 as uuidv4 } from 'uuid'
let dateTimeProvider = require('../utils/date_time_provider')

const isObject = (o: any) => typeof o === 'object' && o !== null

interface IItemTransformer {
    prepareItemsForInsert(items: Item[], fields: ResponseField[]): Item[]
    prepareItemsForUpdate(items: Item[], fields: ResponseField[]): Item[]
    patchItems(items: Item[], fields: ResponseField[]): Item[]
}

export default class ItemTransformer implements IItemTransformer {
    constructor() {
    }
    
    prepareItemsForInsert(items: Item[], fields: ResponseField[]) {
        return items.map((i: Item) => this.prepareForInsert(i, fields))
    }

    prepareItemsForUpdate(items: Item[], fields: ResponseField[]) {
        return items.map((i: Item) => this.prepareForUpdate(i, fields))
    }

    prepareForInsert(item: Item, fields: ResponseField[]) {        
        return this.unpackDates(fields.reduce((pv: any, f: ResponseField) => ({ ...pv, [f.field]: item[f.field] || this.defaultValueFor(f) }), {}))
    }

    prepareForUpdate(item: Item, fields: ResponseField[]) {
         return this.unpackDates(fields.reduce((pv: any, f: ResponseField) => f.field in item ? ({ ...pv, [f.field]: item[f.field] }) : pv, {}))
    }
    
    patchItemsBooleanFields(items: Item[], fields: ResponseField[]) { 
        return items.map((i: Item) => this.patchBoolean(i, fields.filter((f: ResponseField) => f.type === 'boolean')))
    }

    patchItems(items: Item[], fields: ResponseField[]) {
        const patchedBooleanItems = items.map((i: Item) => this.patchBoolean(i, fields.filter((f: ResponseField) => f.type === 'boolean')))
        const patchedObjectItems = patchedBooleanItems.map((i: Item) => this.patchObject(i, fields.filter((f: ResponseField) => f.type === 'object')))
        return patchedObjectItems
    }

    patchObject(item: Item, fields: ResponseField[]) {
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

    patchBoolean(item: Item, fields: ResponseField[]) {
        const i = { ...item }
    
        fields.forEach((f: { field: string }) => {
            if (f.field in i) {
                i[f.field] = this.booleanValueFor(i[f.field])
            }
        })
        return i
    }

    booleanValueFor(value: any) {
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
    defaultValueFor(f: ResponseField) {
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
                return f.isPrimary || f.field ==='_id' ? uuidv4() : ''
            case 'datetime':
                return dateTimeProvider.currentDateTime()
            case 'boolean':
                return false
            case 'object':
                return null
        }
    }

    unpackDates(item: Item) {
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
