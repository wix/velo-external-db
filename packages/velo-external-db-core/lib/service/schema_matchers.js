const { asWixSchema, allowedOperationsFor, appendQueryOperatorsTo, asWixSchemaHeaders } = require('velo-external-db-commons')

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

module.exports = { haveSchemaFor, haveSchemaHeadersFor }
