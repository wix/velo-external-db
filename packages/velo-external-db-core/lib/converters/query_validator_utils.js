const { QueryOperatorsByFieldType } = require('velo-external-db-commons') 
const FilterTransformer = require ('../converters/filter_transformer')
const { EMPTY_FILTER } = require ('../converters/utils')
const WixOperatorToAdapterOperator = new FilterTransformer().wixOperatorToAdapterOperator

const queryAdapterOperatorsFor = (type) => ( QueryOperatorsByFieldType[type].map(op => WixOperatorToAdapterOperator(`$${op}`)) )

const extractFieldsAndOperators = (filter) => { 
    if (filter === EMPTY_FILTER) return []
    if (filter.fieldName) return [{ name: filter.fieldName, operator: filter.operator }]
    return filter.value.map(filter =>  extractFieldsAndOperators(filter)).flat()
}

module.exports = { queryAdapterOperatorsFor, extractFieldsAndOperators }