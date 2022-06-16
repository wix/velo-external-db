import * as mysql from 'mysql'
import SchemaProvider = require('./mysql_schema_provider')
import DataProvider from './mysql_data_provider'
import FilterParser from './sql_filter_transformer'
import DatabaseOperations from './mysql_operations'

type MySqlConfig = {
    host?: string
    user: string
    password: string
    db: string
    cloudSqlConnectionName?: string
}

export default (cfg: MySqlConfig, _poolOptions: {}) => {
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

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations: databaseOperations, connection: pool, cleanup: async() => await pool.end() }
}
