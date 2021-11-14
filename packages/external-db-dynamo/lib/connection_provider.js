const SchemaProvider = require('./dynamo_schema_provider')
const DataProvider  = require('./dynamo_data_provider')
const FilterParser = require('./sql_filter_transformer')
// const DatabaseOperations = require('./dynamo_operations')
const { DynamoDB } = require('@aws-sdk/client-dynamodb')

const extraOptions  = (cfg) => { 
    if (cfg.endpoint)
        return { endpoint: cfg.endpoint }
}

const init = async(cfg, _cfgOptions) => { //remove async
    //cfg : region , endpoint(optional) ,  
    const options = _cfgOptions || {}
    const client = new DynamoDB({region:cfg.region, ...extraOptions(cfg), ...options})
    // const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(client, filterParser)
    const schemaProvider = new SchemaProvider(client)

    // return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations: databaseOperations, connection: pool, cleanup: async () => await pool.end() }
    return { dataProvider, schemaProvider, connection: client, cleanup: () => {}}
}

module.exports = init