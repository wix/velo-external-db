import * as mysql from 'mysql'
import SchemaProvider from './mysql_schema_provider'
import DataProvider from './mysql_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './mysql_operations'
import { MySqlConfig } from './types'


export default (cfg: MySqlConfig, _poolOptions: Record<string, unknown>)  => {
    const config: mysql.PoolConfig = {
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.db,
        port: cfg.port || 3306, 
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

    return { dataProvider, schemaProvider, databaseOperations, connection: pool, cleanup: async() => await pool.end() }
}
