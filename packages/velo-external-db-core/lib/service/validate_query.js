const { InvalidQuery } = require('velo-external-db-commons').errors
const { queryOperatorsFor } = require('velo-external-db-commons') 
const FilterTransformer = require ('../converters/filter_transformer')
const { EMPTY_FILTER } = require ('../converters/utils')
const WixOperatorToAdapterOperator = new FilterTransformer().wixOperatorToAdapterOperator


const validateQueryFields = (fields, filter) => {
    const filterFieldsAndOpsObj = extractFieldsAndOperators(filter)
    validateFilterFieldsExists(fields.map(f => f.field), filterFieldsAndOpsObj)
    validateOperators(fields, filterFieldsAndOpsObj)
}

const validateFilterFieldsExists = (fields, filterObj) => { 
    const allFieldsExists = filterObj.every(field => fields.includes(field.name))
    if (!allFieldsExists) throw new InvalidQuery('Field doesn\'t exists')
}

const validateOperators = (fields, filterObj) => {
    filterObj.forEach(field => {
        const type = fields.find(f => f.field === field.name).type
        if (! queryAdapterOperatorsFor(type).includes(field.operator))
            throw new InvalidQuery(`data type ${type} doesn't allow operator: ${field.operator}`)
    })
}

const queryAdapterOperatorsFor = (type) => ( queryOperatorsFor[type].map(op => WixOperatorToAdapterOperator(`$${op}`)) )

const extractFieldsAndOperators = (filter) => { 
    if (filter === EMPTY_FILTER) return []
    if (filter.fieldName) return [{ name: filter.fieldName, operator: filter.operator }]
    return filter.value.map(filter =>  extractFieldsAndOperators(filter)).flat()
}

module.exports = { validateQueryFields, validateFilterFieldsExists, validateOperators, queryAdapterOperatorsFor, extractFieldsAndOperators }