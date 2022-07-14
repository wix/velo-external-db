import { BigQuery } from '@google-cloud/bigquery'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './bigquery_operations'
import SchemaProvider from './bigquery_schema_provider'
import DataProvider from './bigquery_data_provider'
import { BigQueryConfig } from './types'

export default ({ projectId, databaseId }: BigQueryConfig) => {
    const bigquery = new BigQuery()
    const pool = bigquery.dataset(databaseId)

    const filterParser = new FilterParser()
    const databaseOperations = new DatabaseOperations(pool)
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool, { projectId, databaseId })

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool,  cleanup: async() => {} }
}

