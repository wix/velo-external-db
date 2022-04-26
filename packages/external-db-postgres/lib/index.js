const SchemaProvider = require('./postgres_schema_provider')
const DataProvider = require('./postgres_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const DatabaseOperations = require ('./postgres_operations')
const { supportedOperations } = require('./supported_operations')
const { PostgresConfigValidator } = require ('./config_validator')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class PostgresConnector {
    constructor() {
        this.type = 'postgres'
        this.initialized = false
    }
    
    async initialize(config, options) {
        const { dataProvider, schemaProvider, databaseOperations, connection, cleanup } = await init(config, options)
        this.dataProvider = dataProvider
        this.schemaProvider = schemaProvider
        this.databaseOperations = databaseOperations
        this.connection = connection
        this.cleanup = cleanup
        this.configValidator = new PostgresConfigValidator(config)  
        this.initialized = true
        return { dataProvider, schemaProvider, databaseOperations, connection, cleanup }
    }    
}


module.exports = { SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver, opsDriver, init, DatabaseOperations, supportedOperations, PostgresConnector }
