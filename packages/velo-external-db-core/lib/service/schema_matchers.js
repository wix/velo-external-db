const { asWixSchema, allowedOperationsFor, appendQueryOperatorsFor } = require('velo-external-db-commons')

const schemasList = (dbs, allowedSchemaOperations) => {
    const dbsList = dbs.map( db => ({
        ...db,
        allowedOperations: allowedOperationsFor(db),
        allowedSchemaOperations,
        fields: appendQueryOperatorsFor(db.fields)
    }))

    return dbsList.map(asWixSchema)
}

const readWriteSchemaList = (dbs, allowedSchemaOperations) => {
    const idColumn = { field: '_id', type: 'text' }
    const dbsWithIdColumn = dbs.map( i => ({ ...i, fields: [ ...i.fields, idColumn] }) )
    
    return schemasList(dbsWithIdColumn, allowedSchemaOperations)
}


module.exports = { schemasList, readWriteSchemaList }
