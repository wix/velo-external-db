import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField, FieldType } from '@wix-velo/velo-external-db-types'
import { Field, FieldType as VeloFieldTypeEnum, QueryOperator } from '../spi-model/collection'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const fieldTypeToWixDataEnum = ( fieldType: string ): VeloFieldTypeEnum => {
    switch (fieldType) {
        case FieldType.text:
            return VeloFieldTypeEnum.text
        case FieldType.number:
            return VeloFieldTypeEnum.number
        case FieldType.boolean:
            return VeloFieldTypeEnum.boolean
        case FieldType.object:
            return VeloFieldTypeEnum.object
        case FieldType.datetime:
            return VeloFieldTypeEnum.datetime
        
        default:
           throw new Error(`${fieldType} - Unsupported field type`)
    }
}

export const wixDataEnumToFieldType = (fieldEnum: number): string => {
    switch (fieldEnum) {
        case VeloFieldTypeEnum.text:
        case VeloFieldTypeEnum.longText:
            return FieldType.text
        case VeloFieldTypeEnum.number:
            return FieldType.number
        case VeloFieldTypeEnum.datetime:
            return FieldType.datetime
        case VeloFieldTypeEnum.boolean:
            return FieldType.boolean
        case VeloFieldTypeEnum.object:
            return FieldType.object

        case VeloFieldTypeEnum.singleReference:
        case VeloFieldTypeEnum.multiReference:
        default:
            // TODO: throw specific error
            throw new Error(`Unsupported field type: ${fieldEnum}`)
    }
}

export const subtypeToFieldType = (fieldEnum: number): string => {
    switch (fieldEnum) {
        case VeloFieldTypeEnum.text:
        case VeloFieldTypeEnum.longText:
            return 'string'
        case VeloFieldTypeEnum.number:
            return 'float'
        case VeloFieldTypeEnum.datetime:
            return 'datetime'
        case VeloFieldTypeEnum.boolean:
            return ''
        case VeloFieldTypeEnum.object:
            return ''

        case VeloFieldTypeEnum.singleReference:
        case VeloFieldTypeEnum.multiReference:
        default:
            // TODO: throw specific error
            throw new Error(`There is no subtype for this type: ${fieldEnum}`)
    }
}

export const precisionToFieldType = (fieldEnum: number): string | undefined => {
    switch (fieldEnum) {
        case VeloFieldTypeEnum.number:
            return '10, 2'
    }
    return 

}

export const queryOperatorsToWixDataQueryOperators = (queryOperator: string): QueryOperator => {
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

export const queriesToWixDataQueryOperators = (queryOperators: string[]): QueryOperator[] => queryOperators.map(queryOperatorsToWixDataQueryOperators)


export const responseFieldToWixFormat = (fields: ResponseField[]): Field[] => {
    return fields.map(field => {
        return {
            key: field.field,
            type: fieldTypeToWixDataEnum(field.type)
        }
    })
}

export const wixFormatFieldToInputFields = (field: Field): InputField => ({
    name: field.key,
    type: wixDataEnumToFieldType(field.type),
    subtype: subtypeToFieldType(field.type),
    precision: precisionToFieldType(field.type)
})

export const InputFieldToWixFormatField = (field: InputField): Field => ({
    key: field.name,
    type: fieldTypeToWixDataEnum(field.type)
})

export const WixFormatFieldsToInputFields = (fields: Field[]): InputField[] => fields.map(wixFormatFieldToInputFields)

export const InputFieldsToWixFormatFields = (fields: InputField[]): Field[] =>  fields.map(InputFieldToWixFormatField)

export const compareColumnsInDbAndRequest = (
  columnsInDb: ResponseField[],
  columnsInRequest: Field[]
): {
  columnsToAdd: InputField[];
  columnsToRemove: string[];
  columnsToChangeType: InputField[];
} => {
  const collectionColumnsNamesInDb = columnsInDb.map((f) => f.field)
  const collectionColumnsNamesInRequest = columnsInRequest.map((f) => f.key)

  const columnsToAdd = columnsInRequest.filter((f) => !collectionColumnsNamesInDb.includes(f.key))
                                       .map(wixFormatFieldToInputFields)
  const columnsToRemove = columnsInDb.filter((f) => !collectionColumnsNamesInRequest.includes(f.field))
                                     .map((f) => f.field)

  const columnsToChangeType = columnsInRequest.filter((f) => {
      const fieldInDb = columnsInDb.find((field) => field.field === f.key)
      return fieldInDb && fieldInDb.type !== wixDataEnumToFieldType(f.type)
    })
    .map(wixFormatFieldToInputFields)

  return {
    columnsToAdd,
    columnsToRemove,
    columnsToChangeType,
  }
}
