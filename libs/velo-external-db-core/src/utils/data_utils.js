const { AdapterOperators } = require('@wix-velo/velo-external-db-commons')

const getByIdFilterFor = (itemId) => ({
    fieldName: '_id',
    operator: AdapterOperators.eq,
    value: itemId    
})

module.exports = { getByIdFilterFor }
