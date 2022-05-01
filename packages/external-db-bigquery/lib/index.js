const { DbConnector } = require ('velo-external-db-commons')
const SchemaProvider = require('./bigquery_schema_provider')
const DataProvider = require('./bigquery_data_provider')
const ConfigValidator = require('./bigquery_config_validator')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const DatabaseOperations = require ('./bigquery_operations')
const { supportedOperations } = require('./supported_operations')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class BigQueryConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'bigquery'
    }
}

const bigqueryFactory = async(config, options) => {
    const connector = new BigQueryConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}

module.exports = { SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver, opsDriver, init, DatabaseOperations, supportedOperations, BigQueryConnector, bigqueryFactory }
