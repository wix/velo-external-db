const mariadb = require('mariadb')
const { SchemaProvider, DataProvider, FilterParser, DatabaseOperations } = require('external-db-mysql')

const init = (cfg, _poolOptions) => {
    const config = {
        host     : cfg.host,
        user     : cfg.user,
        password : cfg.password,
        database : cfg.db,

        multipleStatements: true,

        connectionLimit: 10,
        queueLimit: 0,
    }

    const poolOptions = _poolOptions || { }

    if (cfg.cloudSqlConnectionName) {
        config['socketPath'] = `/cloudsql/${cfg.cloudSqlConnectionName}`
    }

    const pool = mariadb.createPool({ ...config, ...poolOptions })
    const databaseOperations = new DatabaseOperations(pool)

    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider, databaseOperations: databaseOperations, connection: pool, cleanup: async () => await pool.end() }
}

module.exports = init