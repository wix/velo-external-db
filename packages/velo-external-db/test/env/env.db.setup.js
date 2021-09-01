const postgres = require('../resources/postgres_resources')
const mysql = require('../resources/mysql_resources')
const spanner = require('../resources/spanner_resources')
const firestore = require('../resources/firestore_resources')
const mssql = require('../resources/mssql_resources')
const { sleep } = require('test-commons')

module.exports = async () => {
    await spanner.initEnv()
    await mysql.initEnv()
    await postgres.initEnv()
    await firestore.initEnv()
    await mssql.initEnv()

    await sleep( 5000 )

    await spanner.cleanup()
    await mysql.cleanup()
    await postgres.cleanup()
    await firestore.cleanup()
    await mssql.cleanup()

};
