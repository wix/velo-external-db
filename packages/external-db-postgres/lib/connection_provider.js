const { Pool, types } = require('pg')
const { builtins } = require('pg-types')
const SchemaProvider = require('./postgres_schema_provider')
const DataProvider = require('./postgres_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require ('./postgres_operations')

types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

const init = (cfg, _poolOptions) => {
    const config = {
        host: cfg.host,
        user: cfg.user,
        password: cfg.password,
        database: cfg.db,
        port: 5432,

        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
    const poolOptions = _poolOptions || {}

    if (cfg.cloudSqlConnectionName) {
        config['host'] = `/cloudsql/${cfg.cloudSqlConnectionName}`
    }

    const filterParser = new FilterParser()
    const pool = new Pool(Object.assign({}, config, poolOptions))

    const databaseOperations = new DatabaseOperations(pool)
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup: async () => await pool.end(() => { }) }
}

module.exports = init