const SchemaProvider = require('./dynamo_schema_provider')
const DataProvider = require('./dynamo_data_provider')
const FilterParser = require('./sql_filter_transformer')
const init = require('./connection_provider')
const DatabaseOperations = require('./dynamo_operations')
const { supportedOperations } = require('./supported_operations')

const driver = () => require('../tests/drivers/sql_filter_transformer_test_support')
const opsDriver = () => require('../tests/drivers/db_operations_test_support')

module.exports = { SchemaProvider, DataProvider, FilterParser, driver, init, opsDriver, DatabaseOperations, supportedOperations }
