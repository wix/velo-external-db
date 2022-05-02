const SchemaProvider = require('./spanner_schema_provider')
const DataProvider = require('./spanner_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const DatabaseOperations = require('./spanner_operations')
const ConfigValidator = require ('./spanner_config_validator')
const init = require('./connection_provider')
const { supportedOperations } = require('./supported_operations')
const { DbConnector } = require('velo-external-db-commons')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class SpannerConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'spanner'
    }
}

const spannerFactory = async(config, options) => {
    const connector = new SpannerConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 


module.exports = { SchemaProvider, init, driver, opsDriver, DataProvider, FilterParser, SchemaColumnTranslator, DatabaseOperations,  supportedOperations, SpannerConnector, spannerFactory }
