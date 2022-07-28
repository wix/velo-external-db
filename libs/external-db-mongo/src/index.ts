export { default as SchemaProvider } from './mongo_schema_provider'
export { default as DataProvider } from './mongo_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as DatabaseOperations } from './mongo_operations'
export { default as init } from './connection_provider'
export * as testResources from '../tests/e2e-testkit/mongo_resources'

import init from './connection_provider'
import { MongoConfigValidator } from './mongo_config_validator'
import { DbConnector } from '@wix-velo/velo-external-db-commons'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class MongoConnector extends DbConnector {
    constructor() {
        super(MongoConfigValidator, init)
        this.type = 'mongo'
    }
}

export const mongoFactory = async (config: any, options: any) => {
    const connector = new MongoConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}
