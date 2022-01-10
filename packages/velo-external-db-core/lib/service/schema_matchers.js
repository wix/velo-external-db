const { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders, ReadOnlyOperations } = require('velo-external-db-commons')

const appendAllowedOperationsToDbs = (dbs, allowedSchemaOperations) => {
    return dbs.map( db => ({
        ...db,
        allowedOperations: allowedOperationsFor(db),
        allowedSchemaOperations,
        fields: appendQueryOperatorsTo(db.fields)
    }))
}

const toHaveSchemas = ( collections, func, ...args ) => ({
    schemas: collections.map( c => func(c, args) )
})

const collectionToHaveReadOnlyCapability = () => expect.objectContaining({ allowedOperations: expect.toIncludeSameMembers(ReadOnlyOperations) })

const haveSchemaFor = (dbs, allowedSchemaOperations) => {
    const dbsWithAllowedOperations = appendAllowedOperationsToDbs(dbs, allowedSchemaOperations)
    return toHaveSchemas(dbsWithAllowedOperations, asWixSchema)
}

const haveSchemaHeadersFor = (collections) => toHaveSchemas(collections, asWixSchemaHeaders)

const toHaveReadOnlyCapability = (collections) => toHaveSchemas(collections, collectionToHaveReadOnlyCapability)


module.exports = { haveSchemaFor, haveSchemaHeadersFor, toHaveReadOnlyCapability }
