export { default as SchemaProvider } from './airtable_schema_provider'
export { default as DataProvider } from './airtable_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as SchemaColumnTranslator } from './sql_schema_translator'
export { default as init } from './connection_provider'
export { default as DatabaseOperations } from './airtable_operations'
export { supportedOperations } from './supported_operations'
export { app as mockServer } from '../tests/drivers/mock_air_table'
export * as testResources from '../tests/e2e-testkit/airtable_resources'
import init from './connection_provider'
import { AirtableConfigValidator } from './airtable_config_validator'
import { DbConnector } from '@wix-velo/velo-external-db-commons'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class AirtableConnector extends DbConnector {
    constructor() {
        super(AirtableConfigValidator, init)
        this.type = 'airtable'
    }
}

export const airtableFactory = async (config: any, options: any) => {
    const connector = new AirtableConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}
