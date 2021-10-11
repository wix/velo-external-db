const postgres = require('../resources/engines/postgres_resources')
const mysql = require('../resources/engines/mysql_resources')
const spanner = require('../resources/engines/spanner_resources')
const firestore = require('../resources/engines/firestore_resources')
const mssql = require('../resources/engines/mssql_resources')
const googleSheet = require('../resources/engines/google_sheets_resourses')

module.exports = async () => {
    const testEngine = process.env.TEST_ENGINE

    switch (testEngine) {
        case 'mysql':
            await mssql.shutdownEnv()
            break

        case 'spanner':
            await spanner.shutdownEnv()
            break

        case 'postgres':
            await postgres.shutdownEnv()
            break

        case 'firestore':
            await firestore.shutdownEnv()
            break

        case 'mssql':
            await mssql.shutdownEnv()
            break

        case 'google-sheet':
            await googleSheet.shutdownEnv()
            break

    }
};
