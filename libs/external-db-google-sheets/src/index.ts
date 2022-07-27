import { DbConnector } from '@wix-velo/velo-external-db-commons'
import SchemaProvider from './google_sheet_schema_provider'
import DataProvider from './google_sheet_data_provider'
import ConfigValidator from './google_sheet_config_validator'
import init from './connection_provider'
import { app as mockServer, cleanupSheets } from '../tests/mock_google_sheets_api'
import { supportedOperations } from './supported_operations'

const driver = () => require('../tests/sql_filter_transformer_test_support.js')

class GoogleSheetConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'google-sheet'
    }
}

const googleSheetFactory = async(config: any, options: any) => {
    const connector = new GoogleSheetConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}



export { SchemaProvider, DataProvider, init, mockServer, driver, cleanupSheets, supportedOperations, GoogleSheetConnector, googleSheetFactory }