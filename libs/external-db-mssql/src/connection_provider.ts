import { ConnectionPool, config } from 'mssql'
import SchemaProvider from './mssql_schema_provider'
import DataProvider from './mssql_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './mssql_operations'
import { notConnectedPool } from './mssql_utils'
import { DbProviders } from '@wix-velo/velo-external-db-types'
import { MSSQLConfig } from './types'

const extraOptions = (cfg: MSSQLConfig) => {
    if (cfg.unsecuredEnv === 'true') {
        return {
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        }
    } else {
        return {
            options: {
                encrypt: true,
                trustServerCertificate: false
            }
        }
    }
}

export default async (cfg: MSSQLConfig, _poolOptions: { [key: string]: any }): Promise<DbProviders<ConnectionPool>> => {
    const config: config = {
        user: cfg.user,
        password: cfg.password,
        database: cfg.db,
        server: cfg.host,
        port: 1433,
        pool: {
            max: 10,
            min: 1,
            idleTimeoutMillis: 30000
        }
    }
    const poolOptions = _poolOptions || {}

    const _pool = new ConnectionPool({ ...config, ...extraOptions(cfg), ...poolOptions })

    const { pool, cleanup } = await _pool.connect()
                                         .then((res: any) => ({ pool: res, cleanup: async() => await pool.close() }))
                                         .catch((e: any) => notConnectedPool(_pool, e) )
    
    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider, schemaProvider, databaseOperations, connection: pool, cleanup } 
}
