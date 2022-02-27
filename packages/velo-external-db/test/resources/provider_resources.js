const { Uninitialized, suitDef } = require('test-commons')

const mysql = require('external-db-mysql')
const mysqlTestEnv = require('./engines/mysql_resources')

const spanner = require('external-db-spanner')
const spannerTestEnv = require('./engines/spanner_resources')

const postgres = require('external-db-postgres')
const postgresTestEnv = require('./engines/postgres_resources')

const firestore = require('external-db-firestore')
const firestoreTestEnv = require('./engines/firestore_resources')

const mssql = require('external-db-mssql')
const mssqlTestEnv = require('./engines/mssql_resources')

const mongo = require('external-db-mongo')
const mongoTestEnv = require('./engines/mongo_resources')

const airtable = require ('external-db-airtable')
const airtableEnv = require ('./engines/airtable_resources')

const dynamo = require ('external-db-dynamodb')
const dynamoTestEnv = require ('./engines/dynamodb_resources.js')

const bigquery = require('external-db-bigquery')
const bigqueryTestEnv = require('./engines/bigquery_resources')

const googleSheet = require('external-db-google-sheets')
const googleSheetTestEnv = require('./engines/google_sheets_resources')

const env = {
    dataProvider: Uninitialized,
    schemaProvider: Uninitialized,
    schemaColumnTranslator: Uninitialized,
    cleanup: Uninitialized,
    driver: Uninitialized,
    schemaOperations: Uninitialized,
}

const dbInit = async(testEnv, impl) => {
    await testEnv.cleanup()

    const { pool, cleanup, schemaProvider } = await testEnv.connection()
    const driver = impl.driver()
        
    env.dataProvider = new impl.DataProvider(pool, driver.filterParser)
    env.schemaProvider = new impl.SchemaProvider(pool, testEnv.schemaProviderTestVariables?.() )
    env.schemaOperations = schemaProvider.supportedOperations()
    env.driver = driver
    env.cleanup = cleanup
}

const dbTeardown = async() => {
    await env.cleanup()
    env.dataProvider = Uninitialized
    env.schemaProvider = Uninitialized
    env.driver = Uninitialized
    env.schemaColumnTranslator = Uninitialized
}

const postgresTestEnvInit = async() => await dbInit(postgresTestEnv, postgres)
const mysqlTestEnvInit = async() => await dbInit(mysqlTestEnv, mysql)
const spannerTestEnvInit = async() => await dbInit(spannerTestEnv, spanner)
const firestoreTestEnvInit = async() => await dbInit(firestoreTestEnv, firestore)
const mssqlTestEnvInit = async() => await dbInit(mssqlTestEnv, mssql)
const mongoTestEnvInit = async() => await dbInit(mongoTestEnv, mongo)
const airTableTestEnvInit = async() => await dbInit(airtableEnv, airtable)
const dynamoTestEnvInit = async() => await dbInit(dynamoTestEnv, dynamo)
const bigqueryTestEnvInit = async() => await dbInit(bigqueryTestEnv, bigquery)
const googleSheetTestEnvInit = async() => await dbInit(googleSheetTestEnv, googleSheet)

const testSuits = {
    mysql: suitDef('MySql', mysqlTestEnvInit),
    postgres: suitDef('Postgres', postgresTestEnvInit),
    spanner: suitDef('Spanner', spannerTestEnvInit),
    firestore: suitDef('Firestore', firestoreTestEnvInit),
    mssql: suitDef('Sql Server', mssqlTestEnvInit),
    mongo: suitDef('Mongo', mongoTestEnvInit),
    airtable: suitDef('Airtable', airTableTestEnvInit),
    dynamodb: suitDef('DynamoDb', dynamoTestEnvInit),
    bigquery: suitDef('BigQuery', bigqueryTestEnvInit),
    'google-sheet': suitDef('Google-Sheet', googleSheetTestEnvInit),
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]
const setupDb = () => testedSuit().setup
const currentDbImplementationName = () => testedSuit().name

module.exports = { env, dbTeardown, setupDb, currentDbImplementationName }