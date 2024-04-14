import { Pool, types } from 'pg'
import { builtins } from 'pg-types'
import SchemaProvider from './postgres_schema_provider'
import DataProvider  from './postgres_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './postgres_operations'
import { PostgresConfig, postgresPoolOptions } from './types'
import { ILogger } from '@wix-velo/external-db-logger'
import IndexProvider from './postgres_index_provider'

types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

export default (cfg: PostgresConfig, _poolOptions: postgresPoolOptions, logger?: ILogger) => {
    const config = {
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.db,
        port: cfg.port || 5432,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    }
    const poolOptions = _poolOptions || {}

    if (cfg.cloudSqlConnectionName) {
        config.host = `/cloudsql/${cfg.cloudSqlConnectionName}`
    }

    const filterParser = new FilterParser()
    const pool = new Pool({ ...config, ...poolOptions })

    const databaseOperations = new DatabaseOperations(pool)
    const dataProvider = new DataProvider(pool, filterParser, logger)
    const schemaProvider = new SchemaProvider(pool, logger)
    const indexProvider = new IndexProvider(pool, logger)

    return { 
        dataProvider,
        schemaProvider,
        databaseOperations, 
        connection: pool, 
        indexProvider,
        cleanup: async() => pool.end(() => {}) 
    }
}

