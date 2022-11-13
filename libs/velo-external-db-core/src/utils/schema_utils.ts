import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { FieldType, QueryOperator } from '../spi-model/collection'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const convertFieldTypeToEnum = ( fieldType: string ): FieldType => {
    switch (fieldType) {
        case 'text':
        case 'url':
            return FieldType.text
        case 'number':
            return FieldType.number
        case 'boolean':
            return FieldType.boolean
        case 'image':
        case 'object':
            return FieldType.object
        case 'datetime':
            return FieldType.datetime
        
        default:
           throw new Error(`${fieldType} - Unsupported field type`)
    }
}

export const convertQueryOperatorsToEnum = (queryOperator: string): QueryOperator => {
    switch (queryOperator) {
        case eq:
            return QueryOperator.eq
        case lt:
            return QueryOperator.lt
        case gt:
            return QueryOperator.gt
        case ne:
            return QueryOperator.ne
        case lte:
            return QueryOperator.lte
        case gte:
            return QueryOperator.gte
        case string_begins:
            return QueryOperator.startsWith
        case string_ends:
            return QueryOperator.endsWith
        case string_contains:
            return QueryOperator.contains
        case include:
            return QueryOperator.hasSome
        // case 'hasAll':
            // return QueryOperator.hasAll
        // case 'exists':
            // return QueryOperator.exists
        // case 'urlized':
            // return QueryOperator.urlized
        default:
            throw new Error(`${queryOperator} - Unsupported query operator`)
    }    
} 

export const convertQueriesToQueryOperatorsEnum = (queryOperators: string[]): QueryOperator[] => {
    return queryOperators.map(convertQueryOperatorsToEnum)
}
