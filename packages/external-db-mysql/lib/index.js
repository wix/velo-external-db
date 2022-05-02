const SchemaProvider = require('./mysql_schema_provider')
const DataProvider = require('./mysql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const DatabaseOperations = require('./mysql_operations')
const { supportedOperations } = require('./supported_operations')
const { MySqlConfigValidator } = require ('./mysql_config_validator')
const { DbConnector } = require('velo-external-db-commons')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')


console.log('aaa')


class MySqlConnector extends DbConnector {
    constructor() {
        super(MySqlConfigValidator, init)
        this.type = 'mysql'
    }
}

const mySqlFactory = async(config, options) => {
    const connector = new MySqlConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 


module.exports = { SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver, init, opsDriver, DatabaseOperations, supportedOperations, MySqlConnector, mySqlFactory }
