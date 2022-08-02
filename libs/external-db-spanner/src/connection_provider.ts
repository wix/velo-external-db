import SchemaProvider from './spanner_schema_provider'
import DataProvider from './spanner_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './spanner_operations'
import { Spanner, Database as SpannerDb } from '@google-cloud/spanner'
import { DbProviders } from '@wix-velo/velo-external-db-types'


export interface SpannerConfig {
    projectId: any
    instanceId: string
    databaseId: string
}

export default (cfg: SpannerConfig, _poolOptions?: {[x:string]: any}): DbProviders<SpannerDb> => {
    const spanner = new Spanner({ projectId: cfg.projectId })
    const instance = spanner.instance(cfg.instanceId)

    const poolOptions = _poolOptions || { }

    const database = instance.database(cfg.databaseId, poolOptions)

    const databaseOperations = new DatabaseOperations(database)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(database, filterParser)
    const schemaProvider = new SchemaProvider(database)

    return { dataProvider, schemaProvider, databaseOperations, connection: database, cleanup: async() => { await database.close() } }
}
