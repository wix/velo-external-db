const { InvalidQuery } = require('velo-external-db-commons').errors
const { extractFieldsAndOperators, queryAdapterOperatorsFor } = require ('./query_validator_utils')

class QueryValidator {
    constructor() {

    }

    validateFilter(fields, filter) {
        const filterFieldsAndOpsObj = extractFieldsAndOperators(filter)
        const fieldNames = fields.map(f => f.field)
        this.validateFilterFieldsExists(fieldNames, filterFieldsAndOpsObj)
        this.validateOperators(fields, filterFieldsAndOpsObj)
    
    }

    validateAggregation(fields, aggregation) {
        const fieldNames = aggregation.projection.map(f => [f.name, f.alias]).flat().filter(f => f !== undefined)
        this.validateFilter(fields, aggregation.postFilter)
        this.validateFieldsExists(fieldNames)
    }

    validateFilterFieldsExists(fields, filterObj) { 
        const nonExistentFields = filterObj.filter(field => !fields.includes(field.name)) 

        if (nonExistentFields.length) {
            throw new InvalidQuery(`fields ${nonExistentFields.map(f => f.name).join(', ')} don't exist`)
        }
    }

    validateOperators(fields, filterObj) {
        filterObj.forEach(field => {
            const fieldType = this.fieldTypeFor(field.name, fields)

            if (! queryAdapterOperatorsFor(fieldType).includes(field.operator))
                throw new InvalidQuery(`data type ${fieldType} doesn't allow operator: ${field.operator}`)
        })
    }

    fieldTypeFor(fieldName, fields) {
        return fields.find(f => f.field === fieldName).type
    }

}

module.exports = QueryValidator