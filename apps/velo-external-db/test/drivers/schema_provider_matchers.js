const hasSameSchemaFieldsLike = (fields) => expect.arrayContaining( fields.map(f => expect.objectContaining( f ) ))

const collectionWithDefaultFields = () => hasSameSchemaFieldsLike([ { field: '_id', type: 'text' },
                                                                          { field: '_createdDate', type: 'datetime' },
                                                                          { field: '_updatedDate', type: 'datetime' },
                                                                          { field: '_owner', type: 'text' } ])

module.exports = { collectionWithDefaultFields, hasSameSchemaFieldsLike }
