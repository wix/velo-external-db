const {Uninitialized} = require('test-commons');
const mysql = require('external-db-mysql')
const spanner = require('external-db-spanner')
const postgres = require('external-db-postgres')
const firestore = require('external-db-firestore')
const mssql = require('external-db-mssql')

const env = {
    driver: Uninitialized,
}

const init = async impl => {
    const driver = impl.opsDriver()

    env.driver = driver
}

const postgresTestEnvInit = async () => await init(postgres)
const mysqlTestEnvInit = async () => await init(mysql)
const spannerTestEnvInit = async () => await init(spanner)
const firestoreTestEnvInit = async () => await init(firestore)
const mssqlTestEnvInit = async () => await init(mssql)

const testSuits = () => [
    ['MySql', mysqlTestEnvInit],
    ['Postgres', postgresTestEnvInit],
    ['Spanner', spannerTestEnvInit],
    ['Firestore', firestoreTestEnvInit],
    // ['Sql Server', mssqlTestEnvInit],
].filter( ([name]) => name.toLowerCase() === process.env.TEST_ENGINE || (name === 'Sql Server' && process.env.TEST_ENGINE === 'mssql') )


module.exports = { env,
    // postgresTestEnvInit,
    // mysqlTestEnvInit,
    // spannerTestEnvInit,
    // firestoreTestEnvInit,
    // mssqlTestEnvInit,
    testSuits,
}