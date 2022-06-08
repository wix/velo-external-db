const SchemaProvider = require('./airtable_schema_provider')
const DataProvider = require('./airtable_data_provider')
const FilterParser = require('./sql_filter_transformer')
const SchemaColumnTranslator = require('./sql_schema_translator')
const init = require('./connection_provider')
const { app: mockServer } = require('../tests/drivers/mock_air_table')
const { supportedOperations } = require('./supported_operations')
const { AirtableConfigValidator } = require('./airtable_config_validator')
const DatabaseOperations = require('./airtable_operations')
const { DbConnector } = require('@wix-velo/velo-external-db-commons')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')


class AirtableConnector extends DbConnector {
    constructor() {
        super(AirtableConfigValidator, init)
        this.type = 'airtable'
    }
}

const airtableFactory = async(config, options) => {
    const connector = new AirtableConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}


module.exports = {
    SchemaProvider, DataProvider, FilterParser, SchemaColumnTranslator, driver,
    init, opsDriver, DatabaseOperations, mockServer, supportedOperations, AirtableConnector, airtableFactory
}
