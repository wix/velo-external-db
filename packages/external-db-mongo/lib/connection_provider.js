const { MongoClient } = require('mongodb')
const SchemaProvider = require('./mongo_schema_provider')
const DataProvider  = require('./mongo_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mongo_operations')

const init = async (cfg) => {
    const uri = `mongodb://${cfg.user}:${cfg.password}@${cfg.host}/${cfg.db}`
    const client = new MongoClient(uri)
    const pool = await client.connect()

    const databaseOperations = new DatabaseOperations(client)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup: async () => await pool.close() }
}

module.exports = init