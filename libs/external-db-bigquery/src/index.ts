export { default as SchemaProvider } from './bigquery_schema_provider'
export { default as DataProvider } from './bigquery_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export { default as SchemaColumnTranslator } from './sql_schema_translator'
export { default as DatabaseOperations } from './bigquery_operations'
export { default as init } from './connection_provider'
export * as testResources from '../tests/e2e-testkit/bigquery_resources'

import ConfigValidator from './bigquery_config_validator'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import init from './connection_provider'
import { BigQueryConfig } from './types'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

class BigQueryConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'bigquery'
    }
}

export const bigqueryFactory = async(config: BigQueryConfig, options: any) => {
    const connector = new BigQueryConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}

