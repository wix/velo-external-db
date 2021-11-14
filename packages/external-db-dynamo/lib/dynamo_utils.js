const { InvalidQuery } = require('velo-external-db-commons').errors

const SystemTable = '_descriptor'

const EMPTY_FILTER = {filterExpr:{}}

const isSystemTable = collectionId => SystemTable === collectionId.trim().toLowerCase()

const validateTable = collection => {
    if (collection && isSystemTable(collection) ) {
        throw new InvalidQuery('Illegal table name')
    }
}

const patchFixDates = record => {
    if (record._createdDate && typeof record._createdDate === 'string') record._createdDate = new Date(record._createdDate)
    if (record._updatedDate && typeof record._updatedDate === 'string') record._updatedDate = new Date(record._updatedDate)
    return record
}


module.exports = { SystemTable, isSystemTable, validateTable, EMPTY_FILTER, patchFixDates }
