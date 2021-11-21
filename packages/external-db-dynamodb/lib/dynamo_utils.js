const { InvalidQuery } = require('velo-external-db-commons').errors

const SystemTable = '_descriptor'

const EMPTY_FILTER = { filterExpr: {} }

const isSystemTable = collectionId => SystemTable === collectionId.trim().toLowerCase()

const validateTable = collection => {
    if (collection && isSystemTable(collection) ) {
        throw new InvalidQuery('Illegal table name')
    }
}

const patchFixDates = record => {
    const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}\s[0-9]{2}:[0-9]{2}/
    const fixedRecord = {}
    Object.keys(record).map(key=> {
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

module.exports = { SystemTable, isSystemTable, validateTable, EMPTY_FILTER, patchFixDates, reformatFields, patchCollectionKeys }
