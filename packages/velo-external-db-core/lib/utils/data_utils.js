const { AdapterOperators } = require('velo-external-db-commons')

const getByIdFilter = (itemId) => ({
    fieldName: '_id',
    operator: AdapterOperators.eq,
    value: itemId    
})

module.exports = { getByIdFilter }
