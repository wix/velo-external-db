import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField, FieldType, DataOperation, CollectionOperation } from '@wix-velo/velo-external-db-types'
import * as collectionSpi from '../spi-model/collection'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const fieldTypeToWixDataEnum = ( fieldType: string ): collectionSpi.FieldType => {
    switch (fieldType) {
        case FieldType.text:
            return collectionSpi.FieldType.text
        case FieldType.longText:
            return collectionSpi.FieldType.longText
        case FieldType.number:
            return collectionSpi.FieldType.number
        case FieldType.boolean:
            return collectionSpi.FieldType.boolean
        case FieldType.object:
            return collectionSpi.FieldType.object
        case FieldType.datetime:
            return collectionSpi.FieldType.datetime
        case FieldType.singleReference:
            return collectionSpi.FieldType.singleReference
        case FieldType.multiReference:
            return collectionSpi.FieldType.multiReference
        
        default:
           throw new Error(`${fieldType} - Unsupported field type`)
    }
}

export const wixDataEnumToFieldType = (fieldEnum: number): string => {
    switch (fieldEnum) {
        case collectionSpi.FieldType.text:
        case collectionSpi.FieldType.longText:
            return FieldType.text
        case collectionSpi.FieldType.number:
            return FieldType.number
        case collectionSpi.FieldType.datetime:
            return FieldType.datetime
        case collectionSpi.FieldType.boolean:
            return FieldType.boolean
        case collectionSpi.FieldType.object:
            return FieldType.object

        case collectionSpi.FieldType.singleReference:
        case collectionSpi.FieldType.multiReference:
        default:
            // TODO: throw specific error
            throw new Error(`Unsupported field type: ${fieldEnum}`)
    }
}

export const subtypeToFieldType = (fieldEnum: number): string => {
    switch (fieldEnum) {
        case collectionSpi.FieldType.text:
        case collectionSpi.FieldType.longText:
            return 'string'
        case collectionSpi.FieldType.number:
            return 'float'
        case collectionSpi.FieldType.datetime:
            return 'datetime'
        case collectionSpi.FieldType.boolean:
            return ''
        case collectionSpi.FieldType.object:
            return ''

        case collectionSpi.FieldType.singleReference:
        case collectionSpi.FieldType.multiReference:
        default:
            // TODO: throw specific error
            throw new Error(`There is no subtype for this type: ${fieldEnum}`)
    }

}

export const queryOperatorsToWixDataQueryOperators = (queryOperator: string): collectionSpi.QueryOperator => {
    switch (queryOperator) {
        case eq:
            return collectionSpi.QueryOperator.eq
        case lt:
            return collectionSpi.QueryOperator.lt
        case gt:
            return collectionSpi.QueryOperator.gt
        case ne:
            return collectionSpi.QueryOperator.ne
        case lte:
            return collectionSpi.QueryOperator.lte
        case gte:
            return collectionSpi.QueryOperator.gte
        case string_begins:
            return collectionSpi.QueryOperator.startsWith
        case string_ends:
            return collectionSpi.QueryOperator.endsWith
        case string_contains:
            return collectionSpi.QueryOperator.contains
        case include:
            return collectionSpi.QueryOperator.hasSome
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

export const dataOperationsToWixDataQueryOperators = (dataOperation: DataOperation): collectionSpi.DataOperation => {
    switch (dataOperation) {
        case DataOperation.query:
            return collectionSpi.DataOperation.query
        case DataOperation.count:
            return collectionSpi.DataOperation.count
        case DataOperation.queryReferenced:
            return collectionSpi.DataOperation.queryReferenced
        case DataOperation.aggregate:
            return collectionSpi.DataOperation.aggregate
        case DataOperation.insert:
            return collectionSpi.DataOperation.insert
        case DataOperation.update:
            return collectionSpi.DataOperation.update
        case DataOperation.remove:
            return collectionSpi.DataOperation.remove
        case DataOperation.truncate:
            return collectionSpi.DataOperation.truncate
        case DataOperation.insertReferences:
            return collectionSpi.DataOperation.insertReferences
        case DataOperation.removeReferences:
            return collectionSpi.DataOperation.removeReferences

        default:
            throw new Error(`${dataOperation} - Unsupported data operation`)
    }
}

export const collectionOperationsToWixDataCollectionOperations = (collectionOperations: CollectionOperation): collectionSpi.CollectionOperation => {
    switch (collectionOperations) {
        case CollectionOperation.update:
            return collectionSpi.CollectionOperation.update
        case CollectionOperation.remove:
            return collectionSpi.CollectionOperation.remove
        
        default:
            throw new Error(`${collectionOperations} - Unsupported collection operation`)
    }
}

export const queriesToWixDataQueryOperators = (queryOperators: string[]): collectionSpi.QueryOperator[] => queryOperators.map(queryOperatorsToWixDataQueryOperators)


export const responseFieldToWixFormat = (fields: ResponseField[]): collectionSpi.Field[] => {
    return fields.map(field => {
        return {
            key: field.field,
            type: fieldTypeToWixDataEnum(field.type)
        }
    })
}

export const wixFormatFieldToInputFields = (field: collectionSpi.Field): InputField => ({
    name: field.key,
    type: wixDataEnumToFieldType(field.type),
    subtype: subtypeToFieldType(field.type)
})

export const InputFieldToWixFormatField = (field: InputField): collectionSpi.Field => ({
    key: field.name,
    type: fieldTypeToWixDataEnum(field.type)
})

export const WixFormatFieldsToInputFields = (fields: collectionSpi.Field[]): InputField[] => fields.map(wixFormatFieldToInputFields)

export const InputFieldsToWixFormatFields = (fields: InputField[]): collectionSpi.Field[] =>  fields.map(InputFieldToWixFormatField)

export const compareColumnsInDbAndRequest = (
  columnsInDb: ResponseField[],
  columnsInRequest: collectionSpi.Field[]
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