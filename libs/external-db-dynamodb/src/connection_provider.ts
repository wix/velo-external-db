import SchemaProvider from'./dynamo_schema_provider'
import DataProvider from './dynamo_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './dynamo_operations'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoConfig } from './types'


const extraOptions  = (cfg: DynamoConfig) => { 
    if (cfg.endpoint)
        return { endpoint: cfg.endpoint }
    return {}
}


export default (cfg: DynamoConfig, _cfgOptions?: {[x: string]: any}) => { 
    const options = _cfgOptions || {}
    const client = new DynamoDB({ region: cfg.region, ...extraOptions(cfg), ...options, logger: undefined })
    const databaseOperations = new DatabaseOperations(client)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(client, filterParser)
    const schemaProvider = new SchemaProvider(client)

    return { dataProvider, schemaProvider, databaseOperations, connection: client, cleanup: () => {} }
}
