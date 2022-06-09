import SchemaProvider = require('./mongo_schema_provider')
import DataProvider = require('./mongo_data_provider')
import FilterParser = require('./sql_filter_transformer')
import init = require('./connection_provider')
import DatabaseOperations = require('./mongo_operations')
import { supportedOperations } from './supported_operations'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import { MongoConfigValidator } from './mongo_config_validator'

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class MongoConnector extends DbConnector {
    type: string
    constructor() {
        super(MongoConfigValidator, init)
        this.type = 'mongo'
    }
}

const mongoFactory = async(config: any, options: any) => {
    const connector = new MongoConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}

export { SchemaProvider, DataProvider, FilterParser, driver, init, opsDriver, DatabaseOperations, supportedOperations, MongoConnector, mongoFactory }
