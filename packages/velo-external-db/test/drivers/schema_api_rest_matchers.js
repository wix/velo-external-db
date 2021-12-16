const { SystemFields } = require('velo-external-db-commons')

const hasSameSchemaFieldsLike = fields => expect.objectContaining( fields.reduce((o, f) => ( { ...o, [f.name]: expect.objectContaining({ displayName: f.name, type: f.type }) } ), {}) )

const schemaWithDefaultFieldsFor = collectionName => expect.objectContaining({ id: collectionName,
                                                                                    displayName: collectionName,
                                                                                    fields: hasSameSchemaFieldsLike( SystemFields ) })

const schemaWithFields = fields => expect.objectContaining({ fields: hasSameSchemaFieldsLike( fields ) })

const collectionWithDefaultFieldsFor = collectionName => expect.objectContaining( {
    schemas: expect.arrayContaining( [ schemaWithDefaultFieldsFor( collectionName ) ] )
} )

const collectionResponseWithDefaultFieldsFor = collectionName => expect.objectContaining( {
    data: collectionWithDefaultFieldsFor( collectionName )
} )

const collectionResponseHasField = field => expect.objectContaining( {
    data: collectionHasField( field )
} )

const collectionResponseWithNoCollections = () => expect.objectContaining( {
    data: toHaveNoCollections()
} )

const collectionHasField = field => expect.objectContaining( {
    schemas: expect.arrayContaining( [ schemaWithFields( [field] ) ] )
} )

const toHaveNoCollections = () => expect.objectContaining( {
    schemas: [ ]
} )

module.exports = { collectionResponseWithDefaultFieldsFor, collectionResponseHasField, collectionResponseWithNoCollections }