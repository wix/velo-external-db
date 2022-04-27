const SchemaProvider = require('./mysql_schema_provider')
const DataProvider = require('./mysql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const DatabaseOperations = require('./mysql_operations')
const { supportedOperations } = require('./supported_operations')
const { MySqlConfigValidator } = require ('./config_validator')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')


class MySqlConnector {
    constructor() {
        this.type = 'mysql'
        this.initialized = false
    }
    
    async initialize(config, options) {
        const { dataProvider, schemaProvider, databaseOperations, connection, cleanup } = await init(config, options)
        this.dataProvider = dataProvider
        this.schemaProvider = schemaProvider
        this.databaseOperations = databaseOperations
        this.connection = connection
        this.cleanup = cleanup
        this.configValidator = new MySqlConfigValidator(config)  
        this.initialized = true
        return { dataProvider, schemaProvider, databaseOperations, connection, cleanup }
    }    
}

const mySqlFactory = async(config, options) => {
    const connector = new MySqlConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 


module.exports = { SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver, init, opsDriver, DatabaseOperations, supportedOperations, MySqlConnector, mySqlFactory }
