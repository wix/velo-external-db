export { default as SchemaProvider } from './mssql_schema_provider'
export { default as DataProvider } from './mssql_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as SchemaColumnTranslator} from './sql_schema_translator'
export { default as DatabaseOperations } from './mssql_operations'
export { default as init } from './connection_provider'
export { supportedOperations } from './supported_operations'
export * as testResources from '../tests/e2e-testkit/mssql_resources'


import init from './connection_provider'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import { MSSQLConfigValidator } from './mssql_config_validator'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class MSSQLConnector extends DbConnector {
    constructor() {
        super(MSSQLConfigValidator, init)
        this.type = 'mssql'
    }
}

export const mssqlFactory = async(config: any, options: any) => {
    const connector = new MSSQLConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}


