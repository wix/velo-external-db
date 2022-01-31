const { InvalidQuery } = require('velo-external-db-commons').errors
const { extractFieldsAndOperators, queryAdapterOperatorsFor, isBlank } = require ('./query_validator_utils')
const { getByIdFilterFor } = require ('../utils/data_utils')

class QueryValidator {
    constructor() {

    }

    validateFilter(fields, filter) {
        const filterFieldsAndOpsObj = extractFieldsAndOperators(filter)
        const filterFields = filterFieldsAndOpsObj.map(f => f.name)
        const fieldNames = fields.map(f => f.field)
        this.validateFieldsExists(fieldNames, filterFields)
        this.validateOperators(fields, filterFieldsAndOpsObj)
    
    }
    
    validateGetById(fields, itemId) {
        if (isBlank(itemId)) throw new InvalidQuery('A value must be provided for itemId')
        this.validateFilter(fields, getByIdFilterFor(itemId))
    }
    
    validateAggregation(fields, aggregation) {
        const fieldsWithAliases = aggregation.projection.reduce((pV, cV) => {
            if (cV.alias) return [...pV, { field: cV.alias, type: fields.find(f => f.field === cV.name).type }]
            return pV
        }, fields)

        const fieldNames = fieldsWithAliases.map(f => f.field)
        const projectionFields = aggregation.projection.map(f => [f.name, f.alias]).flat().filter(f => f !== undefined)
        
        this.validateFilter(fieldsWithAliases, aggregation.postFilter)
        this.validateFieldsExists(fieldNames, projectionFields)
    }

    validateFieldsExists(allFields, queryFields) { 
        const nonExistentFields = queryFields.filter(field => !allFields.includes(field)) 

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