const { DbConnector } = require ('@wix-velo/velo-external-db-commons')
const SchemaProvider = require('./google_sheet_schema_provider')
const DataProvider = require('./google_sheet_data_provider')
const ConfigValidator = require('./google_sheet_config_validator')
const init = require('./connection_provider')
const { app: mockServer, cleanupSheets }  = require('../tests/mock_google_sheets_api')
const { supportedOperations } = require('./supported_operations')

const driver = () => require('../tests/sql_filter_transformer_test_support.js')

class GoogleSheetConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'google-sheet'
    }
}

const googleSheetFactory = async(config, options) => {
    const connector = new GoogleSheetConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
}



module.exports = { SchemaProvider, DataProvider, init, mockServer, driver, cleanupSheets, supportedOperations, GoogleSheetConnector, googleSheetFactory }