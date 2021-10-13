const DataProvider = require('./airtable_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./airtable_operations')
const Airtable = require('airtable')
const init = async (cfg, _poolOptions) => {
    const options = _poolOptions || {}
    const pool = new Airtable({ apiKey: cfg.privateApiKey,...options }).base(cfg.baseId)
    const databaseOperations = new DatabaseOperations(pool)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    return { dataProvider: dataProvider, connection: pool, databaseOperations, cleanup: async () => { } }

}

module.exports = init