import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { ResponseField } from '@wix-velo/velo-external-db-types'

export const hasSameSchemaFieldsLike = (fields: ResponseField[]) => expect.arrayContaining(fields.map((f) => expect.objectContaining( f )))

export const defaultFields = () => hasSameSchemaFieldsLike(SystemFields.map(f => ({ field: f.name, type: f.type })))

export const collectionWithFields = (collectionName: string, fields: ResponseField[], capabilities: any) => ({
    id: collectionName,
    fields: hasSameSchemaFieldsLike(fields),
    capabilities: {
        collectionOperations: capabilities.CollectionOperations,
        dataOperations: capabilities.ReadWriteOperations,
        fieldTypes: capabilities.FieldTypes 
    }
})

export const defaultCollection = (collectionName: string, capabilities: any) => collectionWithFields(collectionName, SystemFields.map(f => ({ field: f.name, type: f.type })), capabilities)
