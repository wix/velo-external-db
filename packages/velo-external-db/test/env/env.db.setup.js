const postgres = require('../resources/engines/postgres_resources')
const mysql = require('../resources/engines/mysql_resources')
const spanner = require('../resources/engines/spanner_resources')
const firestore = require('../resources/engines/firestore_resources')
const mssql = require('../resources/engines/mssql_resources')
const mongo = require ('../resources/engines/mongo_resources')
const googleSheet = require('../resources/engines/google_sheets_resourses')
const { sleep } = require('test-commons')

module.exports = async () => {
    const testEngine = process.env.TEST_ENGINE

    switch (testEngine) {
        case 'mysql':
            if (process.env.NODE_ENV === 'test'){
                await mysql.initEnv()
            }
            break

        case 'spanner':
            await spanner.initEnv()
            break

        case 'postgres':
            await postgres.initEnv()
            break

        case 'firestore':
            await firestore.initEnv()
            break

        case 'mssql':
            await mssql.initEnv()
            break
        case 'mongo':
            await mongo.initEnv()
            break
        case 'google-sheet':
            await googleSheet.initEnv()
            break

    }

    await sleep( 5000 )

    switch (testEngine) {
        case 'mysql':
            await mysql.cleanup()
            break

        case 'spanner':
            await spanner.cleanup()
            break

        case 'postgres':
            await postgres.cleanup()
            break

        case 'firestore':
            await firestore.cleanup()
            break

        case 'mssql':
            await mssql.cleanup()
            break
        case 'google-sheet':
            await googleSheet.cleanup()
            break

        case 'mongo':
            await mongo.cleanup()
            break;
    }
};
