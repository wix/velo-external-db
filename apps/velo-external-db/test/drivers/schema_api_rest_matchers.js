const { SystemFields, asWixSchemaHeaders } = require('@wix-velo/velo-external-db-commons')

const responseWith = (matcher) => expect.objectContaining( { data: matcher } )

const hasSameSchemaFieldsLike = fields => expect.objectContaining( fields.reduce((o, f) => ( { ...o, [f.name]: expect.objectContaining({ displayName: f.name, type: f.type }) } ), {}) )

const schemaWithDefaultFieldsFor = collectionName => expect.objectContaining({ id: collectionName,
                                                                                    displayName: collectionName,
                                                                                    fields: hasSameSchemaFieldsLike( SystemFields ) })

const schemaWithFields = fields => expect.objectContaining({ fields: hasSameSchemaFieldsLike( fields ) })

const collectionWithDefaultFieldsFor = collectionName => expect.objectContaining( {
    schemas: expect.arrayContaining( [ schemaWithDefaultFieldsFor( collectionName ) ] )
} )

const collectionResponseWithDefaultFieldsFor = collectionName => responseWith( collectionWithDefaultFieldsFor( collectionName ) )

const collectionResponseHasField = field => responseWith(collectionHasField( field ))

const collectionResponseWithNoCollections = () => responseWith(toHaveNoCollections())

const collectionResponseWithCollections = (collections) => responseWith( toHaveCollections(collections) )

const listResponseWithCollection = (collectionName) => responseWith( listToHaveCollection(collectionName) )

const collectionHasField = field => expect.objectContaining( {
    schemas: expect.arrayContaining( [ schemaWithFields( [field] ) ] )
} )

const toHaveNoCollections = () => expect.objectContaining( {
    schemas: [ ]
} )

const toHaveCollections = (collections) => expect.objectContaining( {
    schemas: collections.map( asWixSchemaHeaders )
} )

const listToHaveCollection = (collectionName) => expect.objectContaining( {
    schemas: expect.arrayContaining( [ expect.objectContaining( { id: collectionName } ) ] )
} )

module.exports = { collectionResponseWithDefaultFieldsFor, collectionResponseHasField, collectionResponseWithNoCollections, responseWith, 
    collectionResponseWithCollections, listResponseWithCollection }