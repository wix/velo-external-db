const mysql = require('mysql')
const SchemaProvider = require('./mysql_schema_provider')
const DataProvider  = require('./mysql_data_provider')
const FilterParser = require('./sql_filter_transformer')
const DatabaseOperations = require('./mysql_operations')

const init = (cfg, _poolOptions) => {
    const config = {
        host     : cfg.host,
        user     : cfg.user,
        password : cfg.password,
        database : cfg.db,

        waitForConnections: true,
        namedPlaceholders: true,
        multipleStatements: true,

        connectionLimit: 10,
        queueLimit: 0,
    }

    const poolOptions = _poolOptions || { }

    if (cfg.cloudSqlConnectionName) {
        config['socketPath'] = `/cloudsql/${cfg.cloudSqlConnectionName}`
    }

    const pool = mysql.createPool(Object.assign({}, poolOptions, config))
    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations, connection: pool, cleanup: async () => await pool.end() }
}

module.exports = init