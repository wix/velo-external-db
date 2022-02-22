const { Uninitialized, sleep } = require('test-commons')
const { authInit } = require('../drivers/auth_test_support')
const { waitUntil } = require('async-wait-until')

const postgres = require('./engines/postgres_resources')
const mysql = require('./engines/mysql_resources')
const spanner = require('./engines/spanner_resources')
const firestore = require('./engines/firestore_resources')
const mssql = require('./engines/mssql_resources')
const mongo = require('./engines/mongo_resources')
const googleSheet = require('./engines/google_sheets_resources')
const airtable = require ('./engines/airtable_resources')
const dynamo = require ('./engines/dynamodb_resources')
const bigquery = require ('./engines/bigquery_resources')


const env = {
    secretKey: Uninitialized,
    app: Uninitialized,
    internals: Uninitialized,
}

const initApp = async() => {
    process.env.CLOUD_VENDOR = 'azure'

    if (env.app) {
        await env.app.reload()
    } else {
        env.secretKey = authInit()
        env.internals = require('../..').internals

        await waitUntil(() => env.internals().started)
    }
    env.app = env.internals()
}

const teardownApp = async() => {
    await sleep(500)
    await env.app.server.close()
}

const dbInit = async impl => {
    await impl.cleanup()
    impl.setActive()
}

const dbTeardown = async() => {
    await env.app.cleanup()
}

const postgresTestEnvInit = async() => await dbInit(postgres)
const mysqlTestEnvInit = async() => await dbInit(mysql)
const spannerTestEnvInit = async() => await dbInit(spanner)
const firestoreTestEnvInit = async() => await dbInit(firestore)
const mssqlTestEnvInit = async() => await dbInit(mssql)
const mongoTestEnvInit = async() => await dbInit(mongo)
const googleSheetTestEnvInit = async() => await dbInit(googleSheet)
const airTableTestEnvInit = async() => await dbInit(airtable)
const dynamoTestEnvInit = async() => await dbInit(dynamo)
const bigqueryTestEnvInit = async() => await dbInit(bigquery)


const testSuits = {
    mysql: ['MySql', mysqlTestEnvInit],
    postgres: ['Postgres', postgresTestEnvInit],
    spanner: ['Spanner', spannerTestEnvInit],
    firestore: ['Firestore', firestoreTestEnvInit],
    mssql: ['Sql Server', mssqlTestEnvInit],
    mongo: ['Mongo', mongoTestEnvInit],
    airtable: ['Airtable', airTableTestEnvInit],
    dynamodb: ['DynamoDb', dynamoTestEnvInit],
    bigquery: ['BigQuery', bigqueryTestEnvInit],
    'google-sheet': ['Google-Sheet', googleSheetTestEnvInit],
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]



module.exports = { env, initApp, teardownApp, dbTeardown, testedSuit }