const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors

const SystemTable = '_descriptor'

const EmptyFilter = { filterExpr: {} }

const isSystemTable = collectionId => SystemTable === collectionId.trim().toLowerCase()

const validateTable = collection => {
    if (collection && isSystemTable(collection) ) {
        throw new InvalidQuery('Illegal table name')
    }
}

const patchFixDates = record => {
    const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}/
    const fixedRecord = {}
    Object.keys(record).map(key => {
        const value = record[key]
        if (dateRegex.test(value))
            fixedRecord[key] = new Date (value)
        else
            fixedRecord[key] = value
    })
    return fixedRecord
}


const reformatFields = (field) => {
    return {
        field: field.name,
        type: field.type,
    }
}

const patchCollectionKeys = () => (['_id'])

const canQuery = (filterExpr, collectionKeys) => {
    if (!filterExpr) return false

    const filterAttributes = Object.values(filterExpr.ExpressionAttributeNames) 
    return filterAttributes.every(v => collectionKeys.includes(v))
}

const isEmptyObject = obj => Object.keys(obj).length === 0

module.exports = { SystemTable, isSystemTable, validateTable, EmptyFilter, patchFixDates, reformatFields, patchCollectionKeys, canQuery, isEmptyObject }
