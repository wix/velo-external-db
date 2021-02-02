const mysql = require('mysql2')

const init = (type, host, user, password, db) => {
    switch (type) {
        case 'gcp/sql':
            console.log('INIT: gcp/sql')
            const { SchemaProvider } = require('./gcp/sql/cloud_sql_schema_provider')
            const DataProvider = require('./gcp/sql/cloud_sql_data_provider')
            const { FilterParser } = require('./gcp/sql/sql_filter_transformer')

            const pool = mysql.createPool({
                host     : host,
                user     : user,
                password : password,
                database : db,
                waitForConnections: true,
                namedPlaceholders: true,
                // debug: true,
                // trace: true,
                connectionLimit: 10,
                queueLimit: 0/*,
                                    multipleStatements: true*/
            }).promise()
            const filterParser = new FilterParser()
            const dataProvider = new DataProvider(pool, filterParser)
            const schemaProvider = new SchemaProvider(pool)

            return { dataProvider: dataProvider, schemaProvider: schemaProvider }
    }
}

module.exports = { init }