import { ResponseField } from '@wix-velo/velo-external-db-types'

export const hasSameSchemaFieldsLike = (fields: {field: string, [x: string]: any}[]) => expect.arrayContaining( fields.map((f: any) => expect.objectContaining( f ) ))

export const collectionWithDefaultFields = () => hasSameSchemaFieldsLike([ { field: '_id', type: 'text' },
                                                                          { field: '_createdDate', type: 'datetime' },
                                                                          { field: '_updatedDate', type: 'datetime' },
                                                                          { field: '_owner', type: 'text' } ])


export const defaultCollection = (collectionName: string, capabilities: any) => ({
    id: collectionName,
    fields: collectionWithDefaultFields(),
    capabilities: {
        collectionOperations: capabilities.CollectionOperations,
        dataOperations: capabilities.ReadWriteOperations,
        fieldTypes: capabilities.FieldTypes 
    }
})

export const collectionWithFields = (collectionName: string, fields: ResponseField[], capabilities: any) => ({
    id: collectionName,
    fields: hasSameSchemaFieldsLike(fields),
    capabilities: {
        collectionOperations: capabilities.CollectionOperations,
        dataOperations: capabilities.ReadWriteOperations,
        fieldTypes: capabilities.FieldTypes 
    }
})
