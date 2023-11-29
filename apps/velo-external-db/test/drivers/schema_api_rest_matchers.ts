import { SystemFields, asWixSchemaHeaders, PrimaryKeyFieldName } from '@wix-velo/velo-external-db-commons'
import { InputField, DataOperation, } from '@wix-velo/velo-external-db-types'
import { schemaUtils, collectionSpi } from '@wix-velo/velo-external-db-core'
import { Capabilities, ColumnsCapabilities } from '../types'

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

const collectionCapabilities = (dataOperations: DataOperation[]) => ({
    dataOperations: expect.arrayContaining(dataOperations.map(schemaUtils.dataOperationsToWixDataQueryOperators)),
})


const filedMatcher = (field: InputField, columnsCapabilities: ColumnsCapabilities) => ({
    key: field.name,
    type: schemaUtils.fieldTypeToWixDataEnum(field.type),
    capabilities: {
        sortable: columnsCapabilities[field.type].sortable,
        queryOperators: columnsCapabilities[field.type].columnQueryOperators.map(schemaUtils.queryOperatorsToWixDataQueryOperators)
    },
})

const fieldsWith = (fields: InputField[], columnsCapabilities: ColumnsCapabilities) => expect.toIncludeSameMembers(fields.map(f => filedMatcher(f, columnsCapabilities)))

export const collectionResponsesWith = (collectionName: string, fields: InputField[], capabilities: Capabilities) => {
    const dataOperations = fields.map(f => f.name).includes(PrimaryKeyFieldName) ? capabilities.ReadWriteOperations : capabilities.ReadOnlyOperations
    return {
        id: collectionName,
        capabilities: collectionCapabilities(dataOperations),
        fields: fieldsWith(fields, capabilities.ColumnsCapabilities),
        pagingMode: collectionSpi.PagingMode.offset
    }
}

export const createCollectionResponseWith = (collectionName: string, fields: InputField[], capabilities: Capabilities) => collectionResponsesWith(collectionName, fields, capabilities)
