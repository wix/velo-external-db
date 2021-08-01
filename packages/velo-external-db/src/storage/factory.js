const init = (type, host, user, password, db, cloudSqlConnectionName) => {
    switch (type) {
        case 'sql/mysql':
        case 'gcp/sql': {
            console.log('INIT: sql/mysql')

            const { SchemaProvider, DataProvider, FilterParser } = require('external-db-mysql')
            const config = {
                user     : user,
                password : password,
                database : db,

                waitForConnections: true,
                namedPlaceholders: true,
                multipleStatements: true,

                connectionLimit: 10,
                queueLimit: 0,
            }

            if (cloudSqlConnectionName) {
                config['socketPath'] = `/cloudsql/${cloudSqlConnectionName}`
            } else {
                config['host'] = host
            }

            const mysql = require('mysql')

            const pool = mysql.createPool(config)
            const filterParser = new FilterParser()
            const dataProvider = new DataProvider(pool, filterParser)
            const schemaProvider = new SchemaProvider(pool)

            return { dataProvider: dataProvider, schemaProvider: schemaProvider, cleanup: () => pool.end() }
        }
        case 'sql/postgres': {

            console.log('INIT: sql/postgres')
            const { SchemaProvider, DataProvider, FilterParser } = require('external-db-postgres')

            const { Pool, types } = require('pg')
            const { builtins } = require('pg-types')

            types.setTypeParser(builtins.NUMERIC, val => parseFloat(val))

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

    }
}

module.exports = { init }