const { InvalidQuery } = require('velo-external-db-commons').errors
const { extractFieldsAndOperators, queryAdapterOperatorsFor } = require ('./query_validator_utils')

class QueryValidator {
    constructor() {

    }

    validateFilter(fields, filter) {
        const filterFieldsAndOpsObj = extractFieldsAndOperators(filter)
        this.validateFilterFieldsExists(fields.map(f => f.field), filterFieldsAndOpsObj)
        this.validateOperators(fields, filterFieldsAndOpsObj)
    }

    validateFilterFieldsExists(fields, filterObj) { 
        const allFieldsExists = filterObj.every(field => fields.includes(field.name))
        if (!allFieldsExists) throw new InvalidQuery('Field doesn\'t exists')
    }

    validateOperators(fields, filterObj) {
        filterObj.forEach(field => {
            const type = fields.find(f => f.field === field.name).type
            if (! queryAdapterOperatorsFor(type).includes(field.operator))
                throw new InvalidQuery(`data type ${type} doesn't allow operator: ${field.operator}`)
        })
    }
}

module.exports = QueryValidator