const DataProvider = require('./airtable_data_provider')
const FilterParser = require('./sql_filter_transformer')

const Airtable = require('airtable')

const init = async (cfg, _poolOptions) => {
    const options = _poolOptions || {}
    const pool = new Airtable({ apiKey: cfg.privateApiKey,...options }).base(cfg.baseId)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    return { dataProvider: dataProvider, connection: pool, cleanup: async () => { } }

}

module.exports = init