import init from './connection_provider'
import { PostgresConfigValidator } from './postgres_config_validator'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import { ILogger } from '@wix-velo/external-db-logger'

export { default as SchemaProvider } from'./postgres_schema_provider'
export { default as DataProvider } from'./postgres_data_provider'
export { default as FilterParser } from'./sql_filter_transformer'
export { default as SchemaColumnTranslator } from'./sql_schema_translator'
export { default as DatabaseOperations } from'./postgres_operations'
export { default as init } from './connection_provider'
export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')
export * as testResources from '../tests/e2e-testkit/postgres_resources'

export class PostgresConnector extends DbConnector {
    constructor(logger: ILogger) {
        //@ts-ignore - todo: fix this
        super(PostgresConfigValidator, init)
        this.type = 'postgres'
        this.logger = logger
    }
}

export const postgresFactory = async(config: any, logger: ILogger, options: any) => {
    const connector = new PostgresConnector(logger)
    const { connection, cleanup, ...providers } = await connector.initialize(config, options, logger)
    return { connector, connection, providers, cleanup }
}
