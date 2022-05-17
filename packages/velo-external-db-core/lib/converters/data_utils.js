const { isDate } = require('velo-external-db-commons')
const crypto = require('crypto')

const asWixData = e => generateIdsIfNeeded(packDates(e))

const aggregationAsWixData = e => packDates(e)

const generateIdsIfNeeded = item => {
    if ('_id' in item)
        return item
    const sha = crypto.createHash('sha1')
    const fieldsConcat = Object.values(item).join('')
    return { ...item, _id: sha.update(fieldsConcat).digest('base64') }
}

const packDates = item => Object.entries(item)
                                .reduce((o, [k, v]) => ({ ...o, [k]: isDate(v) ? { $date: new Date(v).toISOString() } : v }), {})

module.exports = { asWixData, generateIdsIfNeeded, aggregationAsWixData }