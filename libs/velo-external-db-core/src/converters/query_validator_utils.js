const { QueryOperatorsByFieldType } = require('@wix-velo/velo-external-db-commons') 
const FilterTransformer = require ('../converters/filter_transformer')
const { EmptyFilter } = require ('../converters/utils')
const WixOperatorToAdapterOperator = new FilterTransformer().wixOperatorToAdapterOperator

const queryAdapterOperatorsFor = (type) => ( QueryOperatorsByFieldType[type].map(op => WixOperatorToAdapterOperator(`$${op}`)) )

const extractFieldsAndOperators = (filter) => { 
    if (filter === EmptyFilter) return []
    if (filter.fieldName) return [{ name: filter.fieldName, operator: filter.operator }]
    return filter.value.map(filter =>  extractFieldsAndOperators(filter)).flat()
}

const isBlank = (str) => (!str || /^\s*$/.test(str)) 

module.exports = { queryAdapterOperatorsFor, extractFieldsAndOperators, isBlank }