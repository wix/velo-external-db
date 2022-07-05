const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors
const { extractFieldsAndOperators, queryAdapterOperatorsFor, isBlank } = require ('./query_validator_utils')


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
        const fieldNames = fields.map(f => f.field)
        this.validateFieldsExists(fieldNames, ['_id'])
    }
    
    validateAggregation(fields, aggregation) {
        const fieldsWithAliases = aggregation.projection.reduce((pV, cV) => {
            if (cV.name === '*') return pV
            if (cV.alias) return [...pV, { field: cV.alias, type: fields.find(f => f.field === cV.name).type }]
            return pV
        }, fields)
        const fieldNames = fieldsWithAliases.map(f => f.field)
        const projectionFields = aggregation.projection.filter(f => f.name !== '*').map(f => [f.name, f.alias]).flat().filter(f => f !== undefined)        
        this.validateFilter(fieldsWithAliases, aggregation.postFilter)
        this.validateFieldsExists(fieldNames, projectionFields)
    }

    validateFieldsExists(allFields, queryFields) { 
        const nonExistentFields = queryFields.filter(field => !allFields.includes(field)) 
        if (nonExistentFields.length) {
            throw new InvalidQuery(`fields ${nonExistentFields.join(', ')} don't exist`)
        }
    }

    validateProjection(fields, projection) {
        if (!Array.isArray(projection))
            throw new Error(`Projection must be an array, but was ${typeof projection}`) 
        this.validateFieldsExists(fields.map(f => f.field), projection)
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