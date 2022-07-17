import { ResponseField } from "@wix-velo/velo-external-db-types"

export const hasSameSchemaFieldsLike = (fields: ResponseField[]) => expect.arrayContaining( fields.map((f: any) => expect.objectContaining( f ) ))

export const collectionWithDefaultFields = () => hasSameSchemaFieldsLike([ { field: '_id', type: 'text' },
                                                                          { field: '_createdDate', type: 'datetime' },
                                                                          { field: '_updatedDate', type: 'datetime' },
                                                                          { field: '_owner', type: 'text' } ])
