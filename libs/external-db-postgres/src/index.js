const SchemaProvider = require('./postgres_schema_provider')
const DataProvider = require('./postgres_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const DatabaseOperations = require('./postgres_operations')
const { supportedOperations } = require('./supported_operations')
const { PostgresConfigValidator } = require('./postgres_config_validator')
const { DbConnector } = require('velo-external-db-commons')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class PostgresConnector extends DbConnector {
    constructor() {
        super(PostgresConfigValidator, init)
        this.type = 'postgres'
    }
}

const postgresFactory = async(config, options) => {
    const connector = new PostgresConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}


module.exports = { SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver, opsDriver, init, DatabaseOperations, supportedOperations, PostgresConnector, postgresFactory }
