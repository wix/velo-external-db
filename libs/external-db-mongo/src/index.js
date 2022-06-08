const SchemaProvider = require('./mongo_schema_provider')
const DataProvider = require('./mongo_data_provider')
const FilterParser = require('./sql_filter_transformer')
const init = require('./connection_provider')
const DatabaseOperations = require('./mongo_operations')
const { supportedOperations } = require('./supported_operations')
const { DbConnector } = require ('@wix-velo/velo-external-db-commons')
const { MongoConfigValidator } = require('./mongo_config_validator')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class MongoConnector extends DbConnector {
    constructor() {
        super(MongoConfigValidator, init)
        this.type = 'mongo'
    }
}

const mongoFactory = async(config, options) => {
    const connector = new MongoConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}

module.exports = { SchemaProvider, DataProvider, FilterParser, driver, init, opsDriver, DatabaseOperations, supportedOperations, MongoConnector, mongoFactory }
