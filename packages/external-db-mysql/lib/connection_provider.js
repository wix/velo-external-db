const mysql = require('mysql')
const SchemaProvider = require('./mysql_schema_provider')
const DataProvider  = require('./mysql_data_provider')
const { FilterParser } = require('./sql_filter_transformer')

const init = ([host, user, password, db, cloudSqlConnectionName]) => {
    const config = {
        host     : host,
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

    const pool = mysql.createPool(config)
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, connection: pool, cleanup: () => pool.end() }
}

module.exports = init