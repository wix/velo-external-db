const { Pool, types } = require('pg')
const { builtins } = require('pg-types')
const SchemaProvider = require('./postgres_schema_provider')
const DataProvider = require('./postgres_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require ('./postgres_operations')

types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

const init = ([host, user, password, db, cloudSqlConnectionName], _poolOptions) => {
    const config = {
        host: host,
        user: user,
        password: password,
        database: db,
        port: 5432,

        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
    const poolOptions = _poolOptions || {}

    if (cloudSqlConnectionName) {
        config['host'] = `/cloudsql/${cloudSqlConnectionName}`
    }

    const filterParser = new FilterParser()
    const pool = new Pool(Object.assign({}, config, poolOptions))

    const databaseOperations = new DatabaseOperations(pool)
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup: async () => await pool.end(() => { }) }
}

module.exports = init