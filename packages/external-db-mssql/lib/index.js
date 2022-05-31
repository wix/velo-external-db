const SchemaProvider = require('./mssql_schema_provider')
const DataProvider = require('./mssql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const DatabaseOperations = require('./mssql_operations')
const { supportedOperations } = require('./supported_operations')
const { MSSQLConfigValidator } = require('./mssql_config_validator')
const { DbConnector } = require('@wix-velo/velo-external-db-commons')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class MSSQLConnector extends DbConnector {
    constructor() {
        super(MSSQLConfigValidator, init)
        this.type = 'mssql'
    }
}

const mssqlFactory = async(config, options) => {
    const connector = new MSSQLConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}


module.exports = { SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver, init, opsDriver, DatabaseOperations, supportedOperations, MSSQLConnector, mssqlFactory }
