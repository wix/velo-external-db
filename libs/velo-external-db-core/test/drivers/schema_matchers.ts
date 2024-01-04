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
} from '../../src/utils/schema_utils'
import * as collectionSpi from '../../src/spi-model/collection'


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

export const fieldCapabilitiesObjectFor = (fieldCapabilities: { sortable: boolean, columnQueryOperators: string[] }) => expect.objectContaining({
    sortable: fieldCapabilities.sortable,
    queryOperators: expect.arrayContaining(fieldCapabilities.columnQueryOperators.map(c => queryOperatorsToWixDataQueryOperators(c)))
})

export const fieldInWixFormatFor = (field: ResponseField) => expect.objectContaining({
    key: field.field,
    type: fieldTypeToWixDataEnum(field.type),
    capabilities: field.capabilities? fieldCapabilitiesObjectFor(field.capabilities) : undefined
})

export const fieldsToBeInWixFormat = (fields: ResponseField[]) => expect.arrayContaining(fields.map(f => fieldInWixFormatFor(f)))

export const collectionCapabilitiesObjectFor = (collectionsCapabilities: CollectionCapabilities) => expect.objectContaining({
    dataOperations: expect.arrayContaining(collectionsCapabilities.dataOperations.map(d => dataOperationsToWixDataQueryOperators(d))),
})

export const collectionsInWixFormatFor = (collection: Table) => {
   return expect.objectContaining({
       id: collection.id,
       fields: fieldsToBeInWixFormat(collection.fields),
       capabilities: collection.capabilities? collectionCapabilitiesObjectFor(collection.capabilities): undefined,
       pagingMode: collectionSpi.PagingMode.offset
    })
}

export const collectionsWithReadWriteCapabilitiesInWixFormatFor = (collection: Table) => {
    return expect.objectContaining({
        id: collection.id,
        fields: [],
        capabilities: { 
            dataOperations: Object.values(collectionSpi.DataOperation),
        },
        pagingMode: collectionSpi.PagingMode.offset
     })
 }

 export const collectionsWithReadOnlyCapabilitiesInWixFormatFor = (collection: Table) => {
    const { query, count, queryReferenced, aggregate } = collectionSpi.DataOperation
    return expect.objectContaining({
        id: collection.id,
        fields: [],
        capabilities: { 
            dataOperations: [query, count, queryReferenced, aggregate]
        },
        pagingMode: collectionSpi.PagingMode.offset
     })
 }

export const collectionsListFor = (collections: Table[]) => {
    return expect.objectContaining({ collections: expect.arrayContaining(collections.map(collectionsInWixFormatFor)) })
}

