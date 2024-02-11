import { AdapterOperators, FieldsWithPrecision, PrimaryKeyFieldName } from '@wix-velo/velo-external-db-commons'
import { InputField, ResponseField, FieldType, DataOperation, CollectionOperation, PagingMode } from '@wix-velo/velo-external-db-types'
import * as collectionSpi from '../spi-model/collection'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

export const fieldTypeToWixDataEnum = ( fieldType: string ): collectionSpi.FieldType => {
    switch (fieldType) {
        case FieldType.text:
        case FieldType.longText:
            return collectionSpi.FieldType.text
        case FieldType.number:
            return collectionSpi.FieldType.number
        case FieldType.boolean:
            return collectionSpi.FieldType.boolean
        case FieldType.object:
            return collectionSpi.FieldType.object
        case FieldType.datetime:
            return collectionSpi.FieldType.dataTime
        case FieldType.singleReference:
            return collectionSpi.FieldType.singleReference
        case FieldType.multiReference:
            return collectionSpi.FieldType.multiReference
        case FieldType.time:
            return collectionSpi.FieldType.time
        case FieldType.date:
            return collectionSpi.FieldType.date

        default:
           throw new Error(`${fieldType} - Unsupported field type`)
    }
}

export const wixDataEnumToFieldType = (fieldEnum: collectionSpi.FieldType): string => {
    switch (fieldEnum) {
        case collectionSpi.FieldType.text:
        case collectionSpi.FieldType.url:
        case collectionSpi.FieldType.richText:
        case collectionSpi.FieldType.language:
        case collectionSpi.FieldType.image:
        case collectionSpi.FieldType.video:
        case collectionSpi.FieldType.document:
        case collectionSpi.FieldType.audio:
            return FieldType.text
        
        case collectionSpi.FieldType.number:
            return FieldType.number
        
        case collectionSpi.FieldType.time:
        case collectionSpi.FieldType.date:
        case collectionSpi.FieldType.dataTime:
            return FieldType.datetime
       
        case collectionSpi.FieldType.boolean:
            return FieldType.boolean

        case collectionSpi.FieldType.any:
        case collectionSpi.FieldType.arrayString:
        case collectionSpi.FieldType.arrayDocument:
        case collectionSpi.FieldType.mediaGallery:
        case collectionSpi.FieldType.address:
        case collectionSpi.FieldType.pageLink:
        case collectionSpi.FieldType.reference:
        case collectionSpi.FieldType.object:
        case collectionSpi.FieldType.array:
        case collectionSpi.FieldType.richContent:
            return FieldType.object
        default:
            // TODO: throw specific error
            throw new Error(`Unsupported field type: ${fieldEnum}`)
    }
}

// TODO: create a subtype emun
export const fieldTypeToSubtype = (fieldEnum: collectionSpi.FieldType): string => {
    switch (fieldEnum) {
        case collectionSpi.FieldType.text:
        case collectionSpi.FieldType.url:
        case collectionSpi.FieldType.richText:
            return 'string'
        
        
        case collectionSpi.FieldType.language:
            return 'language' 

        case collectionSpi.FieldType.number:
            return 'float'
        case collectionSpi.FieldType.date:
            return 'date'
        case collectionSpi.FieldType.dataTime:
            return 'datetime'
        case collectionSpi.FieldType.time:
            return 'time'
        case collectionSpi.FieldType.boolean:
            return 'boolean'
         
        case collectionSpi.FieldType.image:
            return 'image'
        case collectionSpi.FieldType.document:
            return 'document'
        case collectionSpi.FieldType.video:
            return 'video'
        case collectionSpi.FieldType.any:
            return 'any'
        case collectionSpi.FieldType.arrayString:
            return 'arrayString'
        case collectionSpi.FieldType.arrayDocument:
            return 'arrayDocument'
        case collectionSpi.FieldType.audio:
            return 'audio'
        case collectionSpi.FieldType.richContent:
            return 'richContent'
        case collectionSpi.FieldType.mediaGallery:
            return 'mediaGallery'
        case collectionSpi.FieldType.address:
            return 'address'
        case collectionSpi.FieldType.pageLink:
            return 'pageLink'
        case collectionSpi.FieldType.reference:
            return 'reference'
        case collectionSpi.FieldType.object:
            return 'object'
        case collectionSpi.FieldType.array:
            return 'array'
        default:
            // TODO: throw specific error
            throw new Error(`Unsupported field type: ${fieldEnum}`)
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

export const fieldKeyToPrecision = (fieldKey: string): number | undefined => {
    return FieldsWithPrecision.includes(fieldKey) ? 255 : undefined
}

export const wixFormatFieldToInputFields = (field: collectionSpi.Field): InputField => ( field.encrypted ? encryptedInputField(field.key) : nonEncryptedInputField(field) )

export const nonEncryptedInputField = (field: collectionSpi.Field) => ({
    name: field.key,
    type: wixDataEnumToFieldType(field.type),
    subtype: fieldTypeToSubtype(field.type),
    precision: fieldKeyToPrecision(field.key),
    isPrimary: field.key === PrimaryKeyFieldName,
})

export const encryptedInputField = (fieldName: string): InputField => ({
    name: fieldName,
    type: FieldType.object,
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

export const pagingModeToWixDataPagingMode = (pagingMode: PagingMode): collectionSpi.PagingMode => {
    switch (pagingMode) {
        case PagingMode.offset:
            return collectionSpi.PagingMode.offset
        case PagingMode.cursor:
            return collectionSpi.PagingMode.cursor
    }
}
