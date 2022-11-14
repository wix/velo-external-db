import { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders, ReadOnlyOperations, AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { convertFieldTypeToEnum, convertQueriesToQueryOperatorsEnum } from '../../src/utils/schema_utils'
const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

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


const toHaveCollection = ( collections: any[], functionOnEachCollection: any, ...args: any ) => ({
    collection: collections.map((c: any) => functionOnEachCollection(c, args))
})

export const queryOperatorsFor = (fieldType: string): string[] => {
    switch (fieldType) {
        case 'text':
        case 'url':
            return [eq, ne, string_contains, string_begins, string_ends, include, gt, gte, lt, lte]
        case 'number':
            return [eq, ne, gt, gte, lt, lte, include]
        case 'boolean':
            return [eq]
        case 'image':
            return []
        case 'object':
            return [eq, ne]
        case 'datetime':
            return [eq, ne, gt, gte, lt, lte]
    
        default:
            throw new Error(`${fieldType} - Unsupported field type`)
    }

}

export const fieldInNewWixFormat = (field: any) => expect.objectContaining({
    key: field.field,
    type: convertFieldTypeToEnum(field.type),
    encrypted: false,
    capabilities: expect.objectContaining({
        sortable: expect.any(Boolean),
        queryOperators: convertQueriesToQueryOperatorsEnum(queryOperatorsFor(field.type))
    })

})

export const capabilitiesInNewWixFormat = () => expect.objectContaining({
    dataOperations: expect.any(Array),
    fieldTypes: expect.any(Array),
    collectionOperations: expect.any(Array),
})

export const collectionInNewWixFormat = (collection: any, args: any) => {
    const [collectionsCapabilities] = args
    return expect.objectContaining({
        id: collection.id,
        fields: expect.arrayContaining(
            collection.fields.map((field: any) => fieldInNewWixFormat(field))
        ),
        capabilities: collectionsCapabilities
    })
}

export const collectionsListFor = (collections: any, collectionsCapabilities: any) => toHaveCollection(collections, collectionInNewWixFormat, collectionsCapabilities)
