const { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders, ReadOnlyOperations } = require('@wix-velo/velo-external-db-commons')

const appendAllowedOperationsToDbs = (dbs, allowedSchemaOperations) => {
    return dbs.map( db => ({
        ...db,
        allowedOperations: allowedOperationsFor(db),
        allowedSchemaOperations,
        fields: appendQueryOperatorsTo(db.fields)
    }))
}

const toHaveSchemas = ( collections, functionOnEachCollection, ...args ) => ({
    schemas: collections.map( c => functionOnEachCollection(c, args) )
})

const collectionToHaveReadOnlyCapability = () => expect.objectContaining({ allowedOperations: expect.toIncludeSameMembers(ReadOnlyOperations) })

const schemasListFor = (dbs, allowedSchemaOperations) => {
    const dbsWithAllowedOperations = appendAllowedOperationsToDbs(dbs, allowedSchemaOperations)
    return toHaveSchemas(dbsWithAllowedOperations, asWixSchema)
}

const schemaHeadersListFor = (collections) => toHaveSchemas(collections, asWixSchemaHeaders)

const schemasWithReadOnlyCapabilitiesFor = (collections) => toHaveSchemas(collections, collectionToHaveReadOnlyCapability)


module.exports = { schemasListFor, schemaHeadersListFor, schemasWithReadOnlyCapabilitiesFor }
