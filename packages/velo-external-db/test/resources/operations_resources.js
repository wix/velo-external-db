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

const env = {
    driver: Uninitialized,
}

const init = async impl => {
    const driver = impl.opsDriver()

    env.driver = driver
}

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
    mysql: ['MySql', mysqlTestEnvInit],
    postgres: ['Postgres', postgresTestEnvInit],
    spanner: ['Spanner', spannerTestEnvInit],
    firestore: ['Firestore', firestoreTestEnvInit],
    mssql: ['Sql Server', mssqlTestEnvInit],
    mongo: ['Mongo', mongoTestEnvInit],
    airtable: ['Airtable', airTableTestEnvInit],
    dynamodb: ['DynamoDb', dynamoTestEnvInit],
    bigquery: ['BigQuery', bigqueryTestEnvInit],
}

const testedSuit = () => {
    const item = testSuits[process.env.TEST_ENGINE]
    return {
        name: item[0],
        setup: item[1]
    }
}


module.exports = { env, testedSuit }