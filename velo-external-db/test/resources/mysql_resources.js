const mysqlSetup = require('@databases/mysql-test/jest/globalSetup')
const mysqlTeardown = require('@databases/mysql-test/jest/globalTeardown')
const mysql = require('mysql2');


const initMySqlEnv = async () => {
    await mysqlSetup()
    return mysql.createPool({
        host     : 'localhost',
        user     : 'test-user',
        password : 'password',
        database : 'test-db',
        waitForConnections: true,
        namedPlaceholders: true,
        // debug: true,
        // trace: true,
        connectionLimit: 10,
        queueLimit: 0/*,
                multipleStatements: true*/
    }).promise();
}

const shutdownMySqlEnv = async () => {
    await mysqlTeardown()
}

module.exports = { initMySqlEnv, shutdownMySqlEnv }