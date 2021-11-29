const { MongoClient } = require('mongodb')
const SchemaProvider = require('./mongo_schema_provider')
const DataProvider = require('./mongo_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mongo_operations')
const { notConnectedPool } = require('./mongo_utils')

const init = async(cfg) => {
    const client = new MongoClient(cfg.connectionUri)

    const { pool, cleanup } = await client.connect()
                                          .then((res) => {
                                              return { pool: res, cleanup: async() => await pool.close() }
                                          }).catch( notConnectedPool )

    const databaseOperations = new DatabaseOperations(client)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup }
}

module.exports = init