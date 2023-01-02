import { 
    Table,
    CollectionCapabilities,
    ResponseField
} from '@wix-velo/velo-external-db-types'
import { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders, ReadOnlyOperations } from '@wix-velo/velo-external-db-commons'
import { 
    fieldTypeToWixDataEnum, 
    queryOperatorsToWixDataQueryOperators,
    dataOperationsToWixDataQueryOperators,
    collectionOperationsToWixDataCollectionOperations,
} from '../../src/utils/schema_utils'

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

export const fieldInNewWixFormat = (field: ResponseField) => expect.objectContaining({
    key: field.field,
    type: fieldTypeToWixDataEnum(field.type),
    capabilities: expect.objectContaining({
        sortable: field.capabilities!.sortable,
        queryOperators: expect.arrayContaining(field.capabilities!.columnQueryOperators.map(c => queryOperatorsToWixDataQueryOperators(c)))
    })
})

export const fieldsInWixFormat = (fields: ResponseField[]) => expect.arrayContaining(fields.map(f => fieldInNewWixFormat(f)))

export const capabilitiesInWixFormat = (collectionsCapabilities: CollectionCapabilities) => expect.objectContaining({
    dataOperations: expect.arrayContaining(collectionsCapabilities.dataOperations.map(d => dataOperationsToWixDataQueryOperators(d))),
    fieldTypes: expect.arrayContaining(collectionsCapabilities.fieldTypes.map(f => fieldTypeToWixDataEnum(f))),
    collectionOperations: expect.arrayContaining(collectionsCapabilities.collectionOperations.map(c => collectionOperationsToWixDataCollectionOperations(c))),
})

export const collectionsInWixFormat = (collection: Table) => {
   return expect.objectContaining({
       id: collection.id,
       fields: fieldsInWixFormat(collection.fields),
       capabilities: capabilitiesInWixFormat(collection.capabilities!)
    })
}

export const collectionsListFor = (collections: Table[]) => {
    return expect.objectContaining({
        collection: collections.map(collectionsInWixFormat)
    })
}

