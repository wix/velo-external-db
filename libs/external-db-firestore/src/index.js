const SchemaProvider = require('./firestore_schema_provider')
const DataProvider = require('./firestore_data_provider')
const ConfigValidator = require('./firestore_config_validator')
const init = require('./connection_provider')
const { supportedOperations } = require('./supported_operations')
const { DbConnector } = require('@wix-velo/velo-external-db-commons')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')
class FirestoreConnector extends DbConnector {
    constructor() {
        super(ConfigValidator, init)
        this.type = 'firestore'
    }
}

const firestoreFactory = async(config, options) => {
    const connector = new FirestoreConnector()
    const { connection, cleanup, ...providers } = await connector.initialize(config, options)
    return { connector, connection, providers, cleanup }
} 


module.exports = { SchemaProvider, init, driver, opsDriver, DataProvider, supportedOperations, FirestoreConnector, firestoreFactory }
