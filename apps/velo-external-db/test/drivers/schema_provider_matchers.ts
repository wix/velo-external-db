import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { ResponseField } from '@wix-velo/velo-external-db-types'

export const hasSameSchemaFieldsLike = (fields: ResponseField[]) => expect.arrayContaining(fields.map((f) => expect.objectContaining( f )))

export const toContainDefaultFields = (columnsCapabilities:any) => hasSameSchemaFieldsLike(SystemFields.map(f => ({
    field: f.name, 
    type: f.type,
    capabilities: columnsCapabilities[f.type]
})))


export const collectionToContainFields = (collectionName: string, fields: ResponseField[], capabilities: any) => ({
    id: collectionName,
    fields: hasSameSchemaFieldsLike(fields),
    capabilities: {
        collectionOperations: capabilities.CollectionOperations,
        dataOperations: capabilities.ReadWriteOperations,
        fieldTypes: capabilities.FieldTypes 
    }
})

export const toBeDefaultCollectionWith = (collectionName: string, capabilities: any) => collectionToContainFields(collectionName, SystemFields.map(f => ({ field: f.name, type: f.type })), capabilities)
