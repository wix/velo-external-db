const { DbConnector } = require ('@wix-velo/velo-external-db-commons')
const SchemaProvider = require('./dynamo_schema_provider')
const DataProvider = require('./dynamo_data_provider')
const ConfigValidator = require('./dynamo_config_validator')
const FilterParser = require('./sql_filter_transformer')
const init = require('./connection_provider')
const DatabaseOperations = require('./dynamo_operations')
const { supportedOperations } = require('./supported_operations')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class DynamoDbConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'dynamoDB'
    }
}

const dynamoDbFactory = async(config, options) => {
    const connector = new DynamoDbConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}



module.exports = { SchemaProvider, DataProvider, FilterParser, driver, init, opsDriver, DatabaseOperations, supportedOperations, DynamoDbConnector, dynamoDbFactory }
