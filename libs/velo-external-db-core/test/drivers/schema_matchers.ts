import { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders, ReadOnlyOperations } from '@wix-velo/velo-external-db-commons'
import { fieldTypeToWixDataEnum } from '../../src/utils/schema_utils'

const appendAllowedOperationsToDbs = (dbs: any[], allowedSchemaOperations: any) => {
    return dbs.map( (db: { fields: any }) => ({
        ...db,
        allowedOperations: allowedOperationsFor(db),
        allowedSchemaOperations,
        fields: appendQueryOperatorsTo(db.fields)
    }))
}

const toHaveSchemas = ( collections: any[], functionOnEachCollection: any, ...args: any ) => ({
    schemas: collections.map( (c: any) => functionOnEachCollection(c, args) )
})

// @ts-ignore
const collectionToHaveReadOnlyCapability = () => expect.objectContaining({ allowedOperations: expect.toIncludeSameMembers(ReadOnlyOperations) })

export const schemasListFor = (dbs: any, allowedSchemaOperations: any) => {
    const dbsWithAllowedOperations = appendAllowedOperationsToDbs(dbs, allowedSchemaOperations)
    return toHaveSchemas(dbsWithAllowedOperations, asWixSchema)
}

export const schemaHeadersListFor = (collections: any) => toHaveSchemas(collections, asWixSchemaHeaders)

export const schemasWithReadOnlyCapabilitiesFor = (collections: any) => toHaveSchemas(collections, collectionToHaveReadOnlyCapability)


const toHaveCollection = ( collections: any[], functionOnEachCollection: any, ...args: any ) =>  expect.objectContaining({
    collection: collections.map((c: any) => functionOnEachCollection(c, args))
})

export const fieldInNewWixFormat = (field: any) => expect.objectContaining({
    key: field.field,
    type: fieldTypeToWixDataEnum(field.type),
    encrypted: false,
    capabilities: expect.objectContaining({
        sortable: expect.any(Boolean),
        queryOperators: expect.any(Array),
    })

})

export const capabilitiesInNewWixFormat = () => expect.objectContaining({
    dataOperations: expect.any(Array),
    fieldTypes: expect.any(Array),
    collectionOperations: expect.any(Array),
})

export const collectionsInNewWixFormat = (collection: any, args: any) => {
    const [collectionsCapabilities] = args
    return expect.objectContaining({
        id: collection.id,
        fields: expect.arrayContaining(
            collection.fields.map((field: any) => fieldInNewWixFormat(field))
        ),
        capabilities: collectionsCapabilities
    })
}

export const collectionsListFor = (collections: any, collectionsCapabilities: any) => toHaveCollection(collections, collectionsInNewWixFormat, collectionsCapabilities)
