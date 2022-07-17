import { Uninitialized } from '@wix-velo/test-commons'
import { suiteDef } from './test_suite_definition'

import * as mysql from '@wix-velo/external-db-mysql'
import * as mysqlTestEnv from './engines/mysql_resources'

import * as spanner from '@wix-velo/external-db-spanner'
import * as spannerTestEnv from './engines/spanner_resources'

import * as postgres from '@wix-velo/external-db-postgres'
import * as postgresTestEnv from './engines/postgres_resources'

import * as firestore from '@wix-velo/external-db-firestore'
import * as firestoreTestEnv from './engines/firestore_resources'

import * as mssql from '@wix-velo/external-db-mssql'
import * as mssqlTestEnv from './engines/mssql_resources'

import * as mongo from '@wix-velo/external-db-mongo'
import * as mongoTestEnv from './engines/mongo_resources'

import * as airtable from '@wix-velo/external-db-airtable'
import * as airtableEnv from './engines/airtable_resources'

import * as dynamo from '@wix-velo/external-db-dynamodb'
import * as dynamoTestEnv from './engines/dynamodb_resources'

import * as bigquery from '@wix-velo/external-db-bigquery'
import * as bigqueryTestEnv from './engines/bigquery_resources'
import { AnyFixMe, ConnectionCleanUp, IDataProvider, ISchemaProvider } from '@wix-velo/velo-external-db-types'

// const googleSheet = require('@wix-velo/external-db-google-sheets')
// const googleSheetTestEnv = require('./engines/google_sheets_resources')

export const env: {
    dataProvider: IDataProvider
    schemaProvider: ISchemaProvider
    cleanup: ConnectionCleanUp
    driver: AnyFixMe
} = {
    dataProvider: Uninitialized,
    schemaProvider: Uninitialized,
    cleanup: Uninitialized,
    driver: Uninitialized,
}

const dbInit = async(testEnv: any, impl: any) => {
    await testEnv.cleanup()

    const { pool, cleanup } = await testEnv.connection()
    const driver = impl.driver()
        
    env.dataProvider = new impl.DataProvider(pool, driver.filterParser)
    env.schemaProvider = new impl.SchemaProvider(pool, testEnv.schemaProviderTestVariables?.() )
    env.driver = driver
    env.cleanup = cleanup
}

export const dbTeardown = async() => {
    await env.cleanup()
    env.dataProvider = Uninitialized
    env.schemaProvider = Uninitialized
    env.driver = Uninitialized
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
// const googleSheetTestEnvInit = async() => await dbInit(googleSheetTestEnv, googleSheet)

const testSuits = {
    mysql: suiteDef('MySql', mysqlTestEnvInit, mysql.supportedOperations),
    postgres: suiteDef('Postgres', postgresTestEnvInit, postgres.supportedOperations),
    spanner: suiteDef('Spanner', spannerTestEnvInit, spanner.supportedOperations),
    firestore: suiteDef('Firestore', firestoreTestEnvInit, firestore.supportedOperations),
    mssql: suiteDef('Sql Server', mssqlTestEnvInit, mssql.supportedOperations),
    mongo: suiteDef('Mongo', mongoTestEnvInit, mongo.supportedOperations),
    airtable: suiteDef('Airtable', airTableTestEnvInit, airtable.supportedOperations),
    dynamodb: suiteDef('DynamoDb', dynamoTestEnvInit, dynamo.supportedOperations),
    bigquery: suiteDef('BigQuery', bigqueryTestEnvInit, bigquery.supportedOperations),
    // 'google-sheet': suiteDef('Google-Sheet', googleSheetTestEnvInit, googleSheet.supportedOperations),
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]
export const supportedOperations = testedSuit().supportedOperations
export const setupDb = () => testedSuit().setup()
export const currentDbImplementationName = () => testedSuit().name
