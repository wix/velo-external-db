const { ConnectionPool } = require('mssql')
const SchemaProvider = require('./mssql_schema_provider')
const DataProvider = require('./mssql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mssql_operations')
const { notConnectedPool } = require ('./mssql_utils')

const extraOptions = cfg => {
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

const init = async(cfg, _poolOptions) => {
    const config = {
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
                                         .then((res) => ({ pool: res, cleanup: async() => await pool.close() }))
                                         .catch(e => notConnectedPool(_pool, e) )
    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool, cfg.db)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup }
}

module.exports = init