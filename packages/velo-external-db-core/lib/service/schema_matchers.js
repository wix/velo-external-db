const { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders, ReadOnlyOperations } = require('velo-external-db-commons')

const appendAllowedOperationsToDbs = (dbs, allowedSchemaOperations) => {
    return dbs.map( db => ({
        ...db,
        allowedOperations: allowedOperationsFor(db),
        allowedSchemaOperations,
        fields: appendQueryOperatorsTo(db.fields)
    }))
}

const toHaveSchemas = ( dbsWithAllowedOperations ) => ({ schemas: dbsWithAllowedOperations.map(asWixSchema) })

const haveSchemaFor = (dbs, allowedSchemaOperations) =>  toHaveSchemas(appendAllowedOperationsToDbs(dbs, allowedSchemaOperations))

const haveSchemaHeadersFor = ( collections ) =>  ({ schemas: collections.map(asWixSchemaHeaders) })

const toHaveReadOnlyCapability = ( received ) => {
    const allowedOperationsForEachDb = received.schemas.map(({ id, allowedOperations }) => ({ id, allowedOperations }))
    const matchToReadOnlyOperations = arr => arr.every( i => ReadOnlyOperations.includes(i) )

    if(allowedOperationsForEachDb.every( db => matchToReadOnlyOperations(db.allowedOperations) ))
        return { pass: true }
    else
        return { 
            message: () => `Expected to have read only capability, but got ${JSON.stringify(allowedOperationsForEachDb)}`,
            pass: false 
        }
}

module.exports = { haveSchemaFor, haveSchemaHeadersFor, toHaveReadOnlyCapability }
