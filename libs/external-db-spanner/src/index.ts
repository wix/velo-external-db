export {default as SchemaProvider} from './spanner_schema_provider'
export { default as DataProvider } from './spanner_data_provider'
export { default as FilterParser } from './sql_filter_transformer'
export {default as SchemaColumnTranslator} from './sql_schema_translator'
export { default as init } from './connection_provider'
export { default as DatabaseOperations } from './spanner_operations'
export { supportedOperations } from './supported_operations'

import { ConfigValidator } from './spanner_config_validator'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import init from './connection_provider'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')

export class SpannerConnector extends DbConnector {
    type: string
    constructor() {
        super(ConfigValidator, init)
        this.type = 'spanner'
    }
}

export const spannerFactory = async(config: any, options: any) => {
    const connector = new SpannerConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 
