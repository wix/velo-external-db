const DataProvider = require('./airtable_data_provider')
const SchemaProvider = require ('./airtable_schema_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./airtable_operations')
const Airtable = require('airtable')
const init = async (cfg, _poolOptions) => {
    const options = _poolOptions || {}
    const pool = new Airtable({ apiKey: cfg.apiPrivateKey,...options }).base(cfg.baseId)
    const databaseOperations = new DatabaseOperations(pool)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool, cfg.apiPrivateKey, cfg.metaApiKey)
    if (process.env.NODE_ENV === 'test')
        schemaProvider.axios.defaults.baseURL = `http://localhost:9000/`
    return { dataProvider, schemaProvider, connection: pool, databaseOperations, cleanup: async () => { } }

}

module.exports = init