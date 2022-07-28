export { default as SchemaProvider } from './mysql_schema_provider'
export { default as DataProvider } from './mysql_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as SchemaColumnTranslator } from './sql_schema_translator'
export { default as init } from './connection_provider'
export { default as DatabaseOperations } from './mysql_operations'
export * as testResources from '../tests/e2e-testkit/mysql_resources'

import { MySqlConfigValidator } from './mysql_config_validator'
import { DatabaseFactoryResponse, DbConnector } from '@wix-velo/velo-external-db-commons'
import init from './connection_provider'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')


export class MySqlConnector extends DbConnector {
    constructor() {
        super(MySqlConfigValidator, init)
        this.type = 'mysql'
    }
}

export const mySqlFactory = async (config: any, options: any): Promise<DatabaseFactoryResponse> => {
    const connector = new MySqlConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 
