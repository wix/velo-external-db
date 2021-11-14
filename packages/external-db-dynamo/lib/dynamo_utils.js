const SystemTable = '_descriptor'

const isSystemTable = collectionId => SystemTable === collectionId.trim().toLowerCase()

const validateTable = collection => {
    if (collection && isSystemTable(collection) ) {
        throw new InvalidQuery('Illegal table name')
    }
}
module.exports = { SystemTable, isSystemTable, validateTable }
