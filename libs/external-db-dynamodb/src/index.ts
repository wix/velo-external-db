export { default as SchemaProvider } from './dynamo_schema_provider'
export { default as DataProvider } from './dynamo_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as DatabaseOperations } from './dynamo_operations'
export { default as init } from './connection_provider'
export { supportedOperations } from './supported_operations'

import init from './connection_provider'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import ConfigValidator from './dynamo_config_validator'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class DynamoDbConnector extends DbConnector {
    type: string
    constructor() {
        super(ConfigValidator, init)
        this.type = 'dynamoDB'
    }
}

export const dynamoDbFactory = async(config: any, options: any) => {
    const connector = new DynamoDbConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}
