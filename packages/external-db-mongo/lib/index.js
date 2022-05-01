const SchemaProvider = require('./mongo_schema_provider')
const DataProvider = require('./mongo_data_provider')
const FilterParser = require('./sql_filter_transformer')
const init = require('./connection_provider')
const DatabaseOperations = require('./mongo_operations')
const { supportedOperations } = require('./supported_operations')
const { MongoConfigValidator } = require ('./config_validator')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class MongoConnector { 
    constructor() { 
        this.type = 'mongo'
        this.initialized = false
    }

    async initialize(config, options) { 
        const { dataProvider, schemaProvider, databaseOperations, connection, cleanup } = await init(config, options)
        this.dataProvider = dataProvider
        this.schemaProvider = schemaProvider
        this.databaseOperations = databaseOperations
        this.connection = connection
        this.cleanup = cleanup
        this.configValidator = new MongoConfigValidator(config)  
        this.initialized = true
        return { dataProvider, schemaProvider, databaseOperations, connection, cleanup }
    }
}

const mongoFactory = async(config, options) => {
    const connector = new MongoConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}

module.exports = { SchemaProvider, DataProvider, FilterParser, driver, init, opsDriver, DatabaseOperations, supportedOperations, MongoConnector, mongoFactory }
