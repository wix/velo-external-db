import { Uninitialized } from '@wix-velo/test-commons'
import * as mysql from '@wix-velo/external-db-mysql'
import * as spanner from '@wix-velo/external-db-spanner'
import * as postgres from '@wix-velo/external-db-postgres'
import * as firestore from '@wix-velo/external-db-firestore'
import * as mssql from '@wix-velo/external-db-mssql'
import * as mongo from '@wix-velo/external-db-mongo'
import * as airtable from '@wix-velo/external-db-airtable'
import * as dynamo from '@wix-velo/external-db-dynamodb'
import * as bigquery from '@wix-velo/external-db-bigquery'
import * as googleSheets from '@wix-velo/external-db-google-sheets'


const suiteDef = (name: string, setup: any, misconfiguredDbOperations: any) => ( { name, setup, misconfiguredDbOperations } )

export const env = {
    driver: Uninitialized,
}

const init = async(impl: any) => {
    const driver = impl.opsDriver()

    env.driver = driver
}

const misconfiguredDbOperation = (impl: any) => (impl.opsDriver().misconfiguredDbOperationOptions())

const postgresTestEnvInit = async() => await init(postgres)
const mysqlTestEnvInit = async() => await init(mysql)
const spannerTestEnvInit = async() => await init(spanner)
const firestoreTestEnvInit = async() => await init(firestore)
const mssqlTestEnvInit = async() => await init(mssql)
const mongoTestEnvInit = async() => await init(mongo)
const airTableTestEnvInit = async() => await init(airtable)
const dynamoTestEnvInit = async() => await init(dynamo)
const bigqueryTestEnvInit = async() => await init(bigquery)
const googleSheetsTestEnvInit = async() => await init(googleSheets)

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
    'google-sheet': suiteDef('Google-Sheet', googleSheetsTestEnvInit, misconfiguredDbOperation(googleSheets)),
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]
export const setupDb = () => testedSuit().setup()
export const currentDbImplementationName = () => testedSuit().name
export const misconfiguredDbOperationOptions = () => testedSuit().misconfiguredDbOperations
