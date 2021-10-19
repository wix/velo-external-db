const {Uninitialized} = require('test-commons');
const mysql = require('external-db-mysql')
const spanner = require('external-db-spanner')
const postgres = require('external-db-postgres')
const firestore = require('external-db-firestore')
const mssql = require('external-db-mssql')
const mongo = require ('external-db-mongo')
const airtable = require ('external-db-airtable')
const mariadb = require ('external-db-mariadb')

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
const mongoTestEnvInit = async () => await init(mongo)
const airtableTestEnvInit = async () => await init(airtable)
const mariadbTestEnvInit = async () => await init(mariadb)

const testSuits = () => [
    ['MySql', mysqlTestEnvInit],
    ['Postgres', postgresTestEnvInit],
    ['Spanner', spannerTestEnvInit],
    ['Firestore', firestoreTestEnvInit],
    ['Sql Server', mssqlTestEnvInit],
    ['Mongo', mongoTestEnvInit],
    ['MariaDB', mariadbTestEnvInit],
    ['Airtable', airtableTestEnvInit]
].filter( ([name]) => name.toLowerCase() === process.env.TEST_ENGINE || (name === 'Sql Server' && process.env.TEST_ENGINE === 'mssql') )


module.exports = { env, testSuits }