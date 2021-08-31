const { ConnectionPool } = require('mssql')
const SchemaProvider = require('./mssql_schema_provider')
const DataProvider  = require('./mssql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mssql_operations')

const init = async ([host, user, password, db]) => {
    const config = {
        user: user,
        password: password,
        database: db,
        server: host,
        port: 1433,
        pool: {
            max: 1,
            min: 0,
            idleTimeoutMillis: 30000
        },
        options: {
            // encrypt: true, // for azure
            trustServerCertificate: true // change to true for local dev / self-signed certs
        }
    }

    const _pool = new ConnectionPool(config)
    const pool = await _pool.connect()

    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup: async () => await pool.close() }
}

module.exports = init