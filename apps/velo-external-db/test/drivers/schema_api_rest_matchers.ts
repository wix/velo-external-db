import { SystemFields, asWixSchemaHeaders } from '@wix-velo/velo-external-db-commons'
import { InputField } from '@wix-velo/velo-external-db-types'

export const responseWith = (matcher: any) => expect.objectContaining( { data: matcher } )

const hasSameSchemaFieldsLike = (fields: InputField[]) => expect.objectContaining( fields.reduce((o: any, f: InputField) => ( { ...o, [f.name]: expect.objectContaining({ displayName: f.name, type: f.type }) } ), {}) )

const schemaWithDefaultFieldsFor = (collectionName: string) => expect.objectContaining({ id: collectionName,
                                                                                    displayName: collectionName,
                                                                                    fields: hasSameSchemaFieldsLike( SystemFields ) })

const schemaWithFields = (fields: InputField[]) => expect.objectContaining({ fields: hasSameSchemaFieldsLike( fields ) })

const collectionWithDefaultFieldsFor = (collectionName: string) => expect.objectContaining( {
    schemas: expect.arrayContaining( [ schemaWithDefaultFieldsFor( collectionName ) ] )
} )

export const collectionResponseWithDefaultFieldsFor = (collectionName: string) => responseWith( collectionWithDefaultFieldsFor( collectionName ) )

export const collectionResponseHasField = (field: InputField) => responseWith(collectionHasField( field ))

export const collectionResponseWithNoCollections = () => responseWith(toHaveNoCollections())

export const collectionResponseWithCollections = (collections: string[]) => responseWith( toHaveCollections(collections) )

export const listResponseWithCollection = (collectionName: string) => responseWith( listToHaveCollection(collectionName) )

const collectionHasField = (field: InputField) => expect.objectContaining( {
    schemas: expect.arrayContaining( [ schemaWithFields( [field] ) ] )
} )

const toHaveNoCollections = () => expect.objectContaining( {
    schemas: [ ]
} )

const toHaveCollections = (collections: string[]) => expect.objectContaining( {
    schemas: collections.map( asWixSchemaHeaders )
} )

const listToHaveCollection = (collectionName: string) => expect.objectContaining( {
    schemas: expect.arrayContaining( [ expect.objectContaining( { id: collectionName } ) ] )
} )
