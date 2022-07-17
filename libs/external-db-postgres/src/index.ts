import init from './connection_provider'
import { PostgresConfigValidator } from './postgres_config_validator'
import { DbConnector } from '@wix-velo/velo-external-db-commons'

export { default as SchemaProvider } from'./postgres_schema_provider'
export { default as DataProvider } from'./postgres_data_provider'
export { default as FilterParser } from'./sql_filter_transformer'
export { default as SchemaColumnTranslator } from'./sql_schema_translator'
export { default as DatabaseOperations } from'./postgres_operations'
export { supportedOperations } from './supported_operations'
export { default as init } from './connection_provider'
export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class PostgresConnector extends DbConnector {
    constructor() {
        //@ts-ignore todo: fix
        super(PostgresConfigValidator, init)
        this.type = 'postgres'
    }
}

export const postgresFactory = async(config: any, options: any) => {
    const connector = new PostgresConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}
