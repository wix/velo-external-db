import { Item } from '@wix-velo/velo-external-db-types'

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
export const escapeIdentifier = (str: string) => str ==='*' ? '*' : `\`${(str || '').replace(/"/g, '""')}\``
export const wildCardWith = (n: number, char: string) => Array(n).fill(char, 0, n).join(', ')

const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/

export const patchDateTime = (item: Item) => {
    const obj: any = {}
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

export const unPatchDateTime = (item: any) => {
    return Object.keys(item).reduce((acc: any, key) => {
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

const isNumber = (value: any) => value !== null && value.toNumber
const isDate = (value: any) => reISO.test(value)

export const patchObjectValueOfItems = (_items: any[], fields: any[]) => {
    const items = [..._items]
    const objectColumnNames = fields.filter(f => f.type === 'object').map(i => i.field)
    items.forEach(i => objectColumnNames.forEach(oc => i[oc] = JSON.stringify(i[oc])))
    return items
}
