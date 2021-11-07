const DataProvider = require('./airtable_data_provider')
const SchemaProvider = require('./airtable_schema_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./airtable_operations')
const Airtable = require('airtable')

const extraOptions  = (cfg) => { 
    if (cfg.baseUrl)
        return { endpointUrl: cfg.baseUrl }
}

const init = async(cfg, _cfgOptions) => {
    const options = _cfgOptions || {}
    const airtableBase = new Airtable({ apiKey: cfg.apiPrivateKey, ...extraOptions(cfg), ...options }).base(cfg.baseId)
    const databaseOperations = new DatabaseOperations(airtableBase)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(airtableBase, filterParser)
    const schemaProvider = new SchemaProvider(airtableBase, {apiKey: cfg.apiPrivateKey, metaApiKey: cfg.metaApiKey, baseUrl: cfg.baseUrl})
    return { dataProvider, schemaProvider, connection: airtableBase, databaseOperations, cleanup: async () => { } }
}

module.exports = init