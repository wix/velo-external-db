export const hasSameSchemaFieldsLike = (fields: {field: string, [x: string]: any}[]) => expect.arrayContaining( fields.map((f: any) => expect.objectContaining( f ) ))

export const collectionWithDefaultFields = () => hasSameSchemaFieldsLike([ { field: '_id', type: 'text' },
                                                                          { field: '_createdDate', type: 'datetime' },
                                                                          { field: '_updatedDate', type: 'datetime' },
                                                                          { field: '_owner', type: 'text' } ])
