const SchemaProvider = require('./spanner_schema_provider')
// const DataProvider = require('./spanner_data_provider')
const init = require('./connection_provider')

class DataProvider {
    constructor(pool, filterParser) {
    }
}

module.exports = { SchemaProvider, init, driver: () => ({ filterParser: null }), DataProvider }
