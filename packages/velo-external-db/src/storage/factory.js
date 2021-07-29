const { resolve } = require('path')
const { promisify } = require('util')
const {translateErrorCodes} = require('external-db-mysql')

const init = async (type, host, user, password, db, cloudSqlConnectionName) => {
    console.log(`INIT: ${type}`)
    const { SchemaProvider, DataProvider, FilterParser } = require('external-db-mysql')
    // const { SchemaProvider } = require('./gcp/sql/cloud_sql_schema_provider')
    // const DataProvider = require('./gcp/sql/cloud_sql_data_provider')
    // const { FilterParser } = require('./gcp/sql/sql_filter_transformer')

    const config = {
        user: user,
        password: password,
        database: db,

        waitForConnections: true,
        namedPlaceholders: true,
        multipleStatements: true,

        // debug: true,
        // trace: true,
        connectionLimit: 10,
        queueLimit: 0,
    }

    if (cloudSqlConnectionName) {
        config['socketPath'] = `/cloudsql/${cloudSqlConnectionName}`
    } else {
        config['host'] = host
    }
            
    const pool = await createPool(config);
    const filterParser = new FilterParser()
    const dataProvider = new DataProvider(pool, filterParser)
    const schemaProvider = new SchemaProvider(pool)

    return { dataProvider: dataProvider, schemaProvider: schemaProvider }
    
}

const createPool = async (config) => {
    const mysql = require('mysql')
    const pool = mysql.createPool(config)
    await checkIfConnectionSucceeded(pool)
    return pool
}

const checkIfConnectionSucceeded = async (pool) => {
    const query = promisify(pool.query).bind(pool);
    return await query('SELECT 1 + 1 AS solution').catch(translateErrorCodes)
}


module.exports = { init }
