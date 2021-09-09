const { ConnectionPool } = require('mssql')
const SchemaProvider = require('./mssql_schema_provider')
const DataProvider = require('./mssql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mssql_operations')

const extraOptions = () => {
    if (process.env.NODE_ENV === 'test') {
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

const notConnectedPool = (pool, err) => {
    return {
        ...pool,
        query: async () => { throw err },
        request: async () => { throw err },
        connect: async () => { return await pool.connect() }
    }
}

const init = async (cfg, _poolOptions) => {
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

    const _pool = new ConnectionPool(Object.assign({}, config, extraOptions(), poolOptions))
    const { pool, cleanup } = await _pool.connect().then((res) => {
        return { pool: res, cleanup: async () => await pool.close() }
    }).catch((e) => {
        return {
            pool: notConnectedPool(_pool, e),
            cleanup: () => { }
        }
    })
    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup }
}

module.exports = init