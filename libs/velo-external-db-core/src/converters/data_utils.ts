import { isDate } from '@wix-velo/velo-external-db-commons'
import { Item } from '@wix-velo/velo-external-db-types'
import * as crypto from 'crypto'

export const asWixData = (e: any) => generateIdsIfNeeded(packDates(e))

export const generateIdsIfNeeded = (item: Item) => {
    if ('_id' in item)
        return item
    const sha = crypto.createHash('sha1')
    const fieldsConcat = Object.values(item).join('')
    return { ...item, _id: sha.update(fieldsConcat).digest('base64') }
}

const packDates = (item: Item) => Object.entries(item)
                                .reduce((o, [k, v]) => ({ ...o, [k]: isDate(v) ? { $date: new Date(v).toISOString() } : v }), {})
