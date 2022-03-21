const { Uninitialized } = require('test-commons')
const mysql = require('external-db-mysql')
const spanner = require('external-db-spanner')
const postgres = require('external-db-postgres')
const firestore = require('external-db-firestore')
const mssql = require('external-db-mssql')
const mongo = require ('external-db-mongo')
const airtable = require ('external-db-airtable')
const dynamo = require ('external-db-dynamodb')
const bigquery = require ('external-db-bigquery')

const suiteDef = (name, setup, misconfiguredDbOperations) => ( { name, setup, misconfiguredDbOperations } )

const env = {
    driver: Uninitialized,
}

const init = async impl => {
    const driver = impl.opsDriver()

    env.driver = driver
}

const misconfiguredDbOperation = impl => (impl.opsDriver().misconfiguredDbOperationOptions())

const postgresTestEnvInit = async() => await init(postgres)
const mysqlTestEnvInit = async() => await init(mysql)
const spannerTestEnvInit = async() => await init(spanner)
const firestoreTestEnvInit = async() => await init(firestore)
const mssqlTestEnvInit = async() => await init(mssql)
const mongoTestEnvInit = async() => await init(mongo)
const airTableTestEnvInit = async() => await init(airtable)
const dynamoTestEnvInit = async() => await init(dynamo)
const bigqueryTestEnvInit = async() => await init(bigquery)

const testSuits = {
    mysql: suiteDef('MySql', mysqlTestEnvInit, misconfiguredDbOperation(mysql)),
    postgres: suiteDef('Postgres', postgresTestEnvInit, misconfiguredDbOperation(postgres)),
    spanner: suiteDef('Spanner', spannerTestEnvInit, misconfiguredDbOperation(spanner)),
    firestore: suiteDef('Firestore', firestoreTestEnvInit, misconfiguredDbOperation(firestore)),
    mssql: suiteDef('Sql Server', mssqlTestEnvInit, misconfiguredDbOperation(mssql)),
    mongo: suiteDef('Mongo', mongoTestEnvInit, misconfiguredDbOperation(mongo)),
    airtable: suiteDef('Airtable', airTableTestEnvInit, misconfiguredDbOperation(airtable)),
    dynamodb: suiteDef('DynamoDb', dynamoTestEnvInit, misconfiguredDbOperation(dynamo)),
    bigquery: suiteDef('BigQuery', bigqueryTestEnvInit, misconfiguredDbOperation(bigquery)),
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]
const setupDb = () => testedSuit().setup()
const currentDbImplementationName = () => testedSuit().name
const misconfiguredDbOperationOptions = () => testedSuit().misconfiguredDbOperations

module.exports = { env, setupDb, currentDbImplementationName, misconfiguredDbOperationOptions }