export { default as SchemaProvider } from './google_sheet_schema_provider'
export { default as DataProvider } from './google_sheet_data_provider'
export { supportedOperations } from './supported_operations'
export { default as init } from './connection_provider'
export { app as mockServer, cleanupSheets } from '../tests/mock_google_sheets_api'
export * as testResources from '../tests/e2e-testkit/google_sheets_resources'

import init from './connection_provider'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import ConfigValidator from './google_sheet_config_validator'

export const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
export const opsDriver = () => require('../tests/drivers/db_operations_test_support')
export const dataDriver = () => require('../tests/drivers/data_provider_test_support')

export class GoogleSheetConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'google-sheet'
    }
}

export const googleSheetFactory = async(config: any, options: any) => {
    const connector = new GoogleSheetConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}
