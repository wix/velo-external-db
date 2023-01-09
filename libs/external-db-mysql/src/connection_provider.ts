import * as mysql from 'mysql'
import SchemaProvider from './mysql_schema_provider'
import DataProvider from './mysql_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './mysql_operations'
import { DbProviders } from '@wix-velo/velo-external-db-types'
import { MySqlConfig } from './types'
import IndexProvider from './mysql_index_provider'


export default (cfg: MySqlConfig, _poolOptions: Record<string, unknown>): DbProviders<mysql.Pool>  => {
    const config: mysql.PoolConfig = {
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.db,

        multipleStatements: true,

        connectionLimit: 10,
        queueLimit: 0,
    }

    const poolOptions = _poolOptions || { }

    if (cfg.cloudSqlConnectionName) {
        config['socketPath'] = `/cloudsql/${cfg.cloudSqlConnectionName}`
    }

    const pool = mysql.createPool({ ...config, ...poolOptions })
    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)
    const indexProvider = new IndexProvider(pool)

    return { dataProvider, schemaProvider, databaseOperations, indexProvider, connection: pool, cleanup: async() => await pool.end() }
}
