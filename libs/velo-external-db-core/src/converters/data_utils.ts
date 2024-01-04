import { isDate } from '@wix-velo/velo-external-db-commons'
import { Item, ItemWithId } from '@wix-velo/velo-external-db-types'
import * as crypto from 'crypto'


export const asWixData = (item: Item) => { 
    return generateIdsIfNeeded(packDates(item))
}

export const asWixDataItem = (item: Item) => { 
    return { item: asWixData(item) }
}

export const generateIdsIfNeeded = (item: Item): ItemWithId => {
    if ('_id' in item)
        return item as ItemWithId
    const sha = crypto.createHash('sha1')
    const fieldsConcat = Object.values(item).join('')
    return { ...item, _id: sha.update(fieldsConcat).digest('base64') }
}

const packDates = (item: Item) => Object.entries(item)
                                .reduce((o, [k, v]) => ({ ...o, [k]: isDate(v) ? { $date: new Date(v).toISOString() } : v }), {})



                                
