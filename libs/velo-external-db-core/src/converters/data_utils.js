const { isDate } = require('@wix-velo/velo-external-db-commons')
const crypto = require('crypto')

const asWixData = (item, projection) => { 
    const projectionNotIncludesId = Array.isArray(projection) && !projection.includes('_id')
    return generateIdsIfNeeded(packDates(item), projectionNotIncludesId)
}

const generateIdsIfNeeded = (item, projectionWithOutId) => {
    if ('_id' in item || projectionWithOutId )
        return item
    const sha = crypto.createHash('sha1')
    const fieldsConcat = Object.values(item).join('')
    return { ...item, _id: sha.update(fieldsConcat).digest('base64') }
}

const packDates = item => Object.entries(item)
                                .reduce((o, [k, v]) => ({ ...o, [k]: isDate(v) ? { $date: new Date(v).toISOString() } : v }), {})

module.exports = { asWixData, generateIdsIfNeeded }