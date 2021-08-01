const { Pool, types } = require('pg')
const { builtins } = require('pg-types')
const { SchemaProvider } = require('./postgres_schema_provider')
const DataProvider = require('./postgres_data_provider')
const { FilterParser } = require('./sql_filter_transformer')

types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

const init = (type, host, user, password, db) => {
    console.log('INIT: sql/postgres')

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

    const filterParser = new FilterParser()
    const pool = new Pool(config)

    pool.on('error', (err) => {
        console.log(err)
    })

    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, cleanup: async () => await pool.end(() => {}) }
}

module.exports = init