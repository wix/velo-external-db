import { errors } from '@wix-velo/velo-external-db-commons'
import { AdapterAggregation, AdapterFilter, ResponseField } from '@wix-velo/velo-external-db-types'
import { extractFieldsAndOperators, queryAdapterOperatorsFor, isBlank } from './query_validator_utils'
const { InvalidQuery } = errors

export default class QueryValidator {
    constructor() {
    }

    validateFilter(fields: ResponseField[], filter: AdapterFilter) {
        const filterFieldsAndOpsObj = extractFieldsAndOperators(filter)
        const filterFields = filterFieldsAndOpsObj.map((f: { name: string }) => f.name)
        const fieldNames = fields.map((f: ResponseField) => f.field)
        this.validateFieldsExists(fieldNames, filterFields)
        this.validateOperators(fields, filterFieldsAndOpsObj)
    }
    
    validateGetById(fields: ResponseField[], itemId: string) {
        if (isBlank(itemId)) throw new InvalidQuery('A value must be provided for itemId')
        const fieldNames = fields.map((f: ResponseField) => f.field)
        this.validateFieldsExists(fieldNames, ['_id'])
    }
    
    validateAggregation(fields: ResponseField[], aggregation: AdapterAggregation) {
        const fieldsWithAliases = aggregation.projection.reduce((pV: any, cV: { name: string; alias?: any }) => {
            if (cV.name === '*') return pV
            if (cV.alias) return [...pV, { field: cV.alias, type: fields.find((f: ResponseField) => f.field === cV.name)?.type }]
            return pV
        }, fields)
        const fieldNames = fieldsWithAliases.map((f: { field: any }) => f.field)
        const projectionFields = aggregation.projection.filter((f: { name: string }) => f.name !== '*').map((f: { name: string; alias?: string }) => [f.name, f.alias]).flat().filter((f: any) => f !== undefined)        
        this.validateFilter(fieldsWithAliases, aggregation.postFilter)
        this.validateFieldsExists(fieldNames, projectionFields)
    }

    validateFieldsExists(allFields: string | any[], queryFields: any[]) { 
        const nonExistentFields = queryFields.filter((field: any) => !allFields.includes(field)) 

        if (nonExistentFields.length) {
            throw new InvalidQuery(`fields ${nonExistentFields.map((f: { name: any }) => f.name).join(', ')} don't exist`)
        }
    }

    validateOperators(fields: any, filterObj: any[]) {
        filterObj.forEach((field: { name: any; operator: any }) => {
            const fieldType = this.fieldTypeFor(field.name, fields)

            if (! queryAdapterOperatorsFor(fieldType).includes(field.operator))
                throw new InvalidQuery(`data type ${fieldType} doesn't allow operator: ${field.operator}`)
        })
    }

    fieldTypeFor(fieldName: any, fields: any[]) {
        return fields.find((f: { field: any }) => f.field === fieldName).type
    }

}
