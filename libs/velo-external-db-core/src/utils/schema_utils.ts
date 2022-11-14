import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField } from '@wix-velo/velo-external-db-types'
import { Field, FieldType, QueryOperator } from '../spi-model/collection'
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

export const convertEnumToFieldType = (fieldEnum: number): string => {
    switch (fieldEnum) {
        case FieldType.text:
        case FieldType.longText:
            return 'text'
        case FieldType.number:
            return 'number'
        case FieldType.datetime:
            return 'datetime'
        case FieldType.boolean:
            return 'boolean'
        case FieldType.object:
            return 'object'

        case FieldType.singleReference:
        case FieldType.multiReference:
        default:
            // TODO: throw specific error
            throw new Error(`Unsupported field type: ${fieldEnum}`)
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

export const convertResponseFieldToWixFormat = (fields: ResponseField[]): Field[] => {
    return fields.map(field => {
        return {
            key: field.field,
            type: convertFieldTypeToEnum(field.type)
        }
    })
}

export const convertWixFormatFieldsToInputFields = (fields: Field[]): InputField[] => {
    return fields.map( field => ({
        name: field.key,
        type: convertEnumToFieldType(field.type)
    }))
}
