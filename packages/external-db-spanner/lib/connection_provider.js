// const mysql = require('mysql')
const SchemaProvider = require('./spanner_schema_provider')
// const DataProvider  = require('./spanner_data_provider')
// const FilterParser = require('./sql_filter_transformer')
// const DatabaseOperations = require('./mysql_operations')
const { Spanner } = require('@google-cloud/spanner')

const init = ([projectId, instanceId, databaseId]) => {

    const spanner = new Spanner({projectId: projectId})
    const instance = spanner.instance(instanceId);
    // todo: investigate SessionPoolOptions
    const database = instance.database(databaseId);

    // const databaseOperations = new DatabaseOperations(pool)

    // const filterParser = new FilterParser()
    // const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(database)

    return { dataProvider: null, schemaProvider: schemaProvider, databaseOperations: null, connection: null, cleanup: async () => {} }
}

module.exports = init