const { MongoClient } = require('mongodb')
const SchemaProvider = require('./mongo_schema_provider')
const DataProvider = require('./mongo_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mongo_operations')
const { notConnectedPool, emptyClient } = require('./mongo_utils')
const { documentDBConnectionOptions } = require('./documentdb_utils')

const init = async(cfg) => {
    const { connectionUri, options } = cfg.documentDb ? await documentDBConnectionOptions(cfg, __dirname) : { connectionUri: cfg.connectionUri, options: {} }
    const client = connectionUri ? new MongoClient(connectionUri, options) : emptyClient()

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