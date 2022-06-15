import { escapeId } from 'mysql'
import { errors, patchDateTime } from '@wix-velo/velo-external-db-commons'
import { Item } from '@wix-velo/velo-external-db-types'

export const wildCardWith = (n: number, char: any) => Array(n).fill(char, 0, n).join(', ')

export const escapeTable = (t: string) => {
    if(t && t.indexOf('.') !== -1) {
        throw new errors.InvalidQuery('Illegal table name')
    }
    return escapeId(t)
}

const escapeIdField = (f: string) => f === '*' ? '*' : escapeId(f)

const patchObjectField = (item: Item) => Object.entries(item).reduce((acc: {[key:string]: any}, [key, value]) => {
        acc[key] = typeof value === 'object' ? JSON.stringify(value) : value
        return acc
    }, {})


export const patchItem = (item: Item) => {
    const itemWithPatchedDateTime = patchDateTime(item)
    const itemWithPatchedObject = patchObjectField(itemWithPatchedDateTime)

    return itemWithPatchedObject
}

export { escapeIdField as escapeId }
