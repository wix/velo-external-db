const postgres = require('../resources/postgres_resources')
const mysql = require('../resources/mysql_resources')
const spanner = require('../resources/spanner_resources')
const firestore = require('../resources/firestore_resources')
const mssql = require('../resources/mssql_resources')

module.exports = async () => {
    await spanner.shutdownEnv()
    await mysql.shutdownEnv()
    await postgres.shutdownEnv()
    await firestore.shutdownEnv()
    await mssql.shutdownEnv()
};
