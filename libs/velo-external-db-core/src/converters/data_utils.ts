import { isDate } from '@wix-velo/velo-external-db-commons'
import { Item, ItemWithId } from '@wix-velo/velo-external-db-types'
import * as crypto from 'crypto'

export const asWixData = (item: Item, projection?: any) => { 
    const projectionNotIncludesId = Array.isArray(projection) && !projection.includes('_id')
    return generateIdsIfNeeded(packDates(item), projectionNotIncludesId)
}

export const generateIdsIfNeeded = (item: Item, projectionWithOutId?: boolean): ItemWithId => {
    if ('_id' in item || projectionWithOutId)
        return item as ItemWithId
    const sha = crypto.createHash('sha1')
    const fieldsConcat = Object.values(item).join('')
    return { ...item, _id: sha.update(fieldsConcat).digest('base64') }
}

const packDates = (item: Item) => Object.entries(item)
                                .reduce((o, [k, v]) => ({ ...o, [k]: isDate(v) ? { $date: new Date(v).toISOString() } : v }), {})
