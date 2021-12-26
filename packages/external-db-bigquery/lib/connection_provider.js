const { BigQuery } = require('@google-cloud/bigquery')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require ('./bigquery_operations')
const { SchemaProvider } = require('./bigquery_schema_provider')
const DataProvider = require('./bigquery_data_provider')

const init = ({ projectId, databaseId }) => {
    const bigquery = new BigQuery()
    const pool = bigquery.dataset(databaseId)

    const filterParser = new FilterParser()
    const databaseOperations = new DatabaseOperations(pool)
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool, { projectId, databaseId })

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool,  cleanup: async() => {} }
}

module.exports = init