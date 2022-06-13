import { MongoClient } from 'mongodb'
import SchemaProvider from './mongo_schema_provider'
import DataProvider from './mongo_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './mongo_operations'
import { notConnectedPool, emptyClient } from './mongo_utils'
import { DbProviders } from '@wix-velo/velo-external-db-types'

type MongoConfig = { //should be here?
    connectionUri?: string
}

export default async (cfg: MongoConfig): Promise<DbProviders> => {
    const client = cfg.connectionUri ? new MongoClient(cfg.connectionUri) : emptyClient()

    const { pool, cleanup } = await client.connect()
                                          .then((res: any) => {
                                              return { pool: res, cleanup: async() => await pool.close() }
                                          }).catch( notConnectedPool )

    const databaseOperations = new DatabaseOperations(client)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider, schemaProvider, databaseOperations, connection: pool, cleanup }
}