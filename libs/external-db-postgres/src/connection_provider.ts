import { Pool, types } from 'pg'
import { builtins } from 'pg-types'
import SchemaProvider from './postgres_schema_provider'
import DataProvider  from './postgres_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './postgres_operations'
import { PostgresConfig, postgresPoolOptions } from './types'

types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

export default (cfg: PostgresConfig, _poolOptions: postgresPoolOptions) => {
    const config = {
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.db,
        port: cfg.port || 5432,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: process.env['SSL'] === 'true' ? { rejectUnauthorized: false } : undefined,
    }
    const poolOptions = _poolOptions || {}

    if (cfg.cloudSqlConnectionName) {
        config.host = `/cloudsql/${cfg.cloudSqlConnectionName}`
    }

    const filterParser = new FilterParser()
    const pool = new Pool({ ...config, ...poolOptions })

    const databaseOperations = new DatabaseOperations(pool)
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { 
        dataProvider: dataProvider,
        schemaProvider: schemaProvider,
        databaseOperations, 
        connection: pool, 
        cleanup: async() => pool.end(() => {}) 
    }
}

