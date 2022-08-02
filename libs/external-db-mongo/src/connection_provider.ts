import { MongoClient } from 'mongodb'
import SchemaProvider from './mongo_schema_provider'
import DataProvider from './mongo_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './mongo_operations'
import { notConnectedPool, emptyClient, MongoStubPool, MongoStubClient } from './mongo_utils'
import { ConnectionCleanUp, DbProviders } from '@wix-velo/velo-external-db-types'


type MongoConfig = {
    connectionUri?: string
}

export default async(cfg: MongoConfig): Promise<DbProviders<MongoClient | MongoStubPool>> => {
    const client: MongoClient | MongoStubClient = cfg.connectionUri ? new MongoClient(cfg.connectionUri) : emptyClient()

    const { pool, cleanup }: { pool: MongoClient| MongoStubPool, cleanup: ConnectionCleanUp } = await client.connect()
        .then((res: MongoClient | MongoStubPool) => {
            return { pool: res, cleanup: async(): Promise<void> => await pool.close() }
        }).catch(err => {
            return { pool: notConnectedPool(err), cleanup: async() => { } }
        })

    const databaseOperations = new DatabaseOperations(client)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider, schemaProvider, databaseOperations, connection: pool, cleanup }
}