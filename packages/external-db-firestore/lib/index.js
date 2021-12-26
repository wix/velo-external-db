const { SchemaProvider, schemaSupportedOperations } = require('./firestore_schema_provider')
const DataProvider = require('./firestore_data_provider')
const init = require('./connection_provider')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

module.exports = { SchemaProvider, init, driver, opsDriver, DataProvider, schemaSupportedOperations }
