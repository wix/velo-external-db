import { Uninitialized } from '@wix-velo/test-commons'
import { suiteDef } from './test_suite_definition'

import * as mysql from '@wix-velo/external-db-mysql'

import * as spanner from '@wix-velo/external-db-spanner'

import * as postgres from '@wix-velo/external-db-postgres'

import * as firestore from '@wix-velo/external-db-firestore'

import * as mssql from '@wix-velo/external-db-mssql'

import * as mongo from '@wix-velo/external-db-mongo'

import * as airtable from '@wix-velo/external-db-airtable'

import * as dynamo from '@wix-velo/external-db-dynamodb'

import * as bigquery from '@wix-velo/external-db-bigquery'

import * as googleSheet from '@wix-velo/external-db-google-sheets'

import { AnyFixMe, ConnectionCleanUp, IDataProvider, ISchemaProvider } from '@wix-velo/velo-external-db-types'


export const env: {
    dataProvider: IDataProvider
    schemaProvider: ISchemaProvider
    cleanup: ConnectionCleanUp
    driver: AnyFixMe
    dataDriver?: AnyFixMe
} = {
    dataProvider: Uninitialized,
    schemaProvider: Uninitialized,
    cleanup: Uninitialized,
    driver: Uninitialized,
    dataDriver: Uninitialized
}

const dbInit = async(impl: any) => {
    const testResources = impl.testResources
    await testResources.cleanup()

    const { pool, cleanup } = await testResources.connection()
    const driver = impl.driver()
        
    env.dataProvider = new impl.DataProvider(pool, driver.filterParser)
    env.schemaProvider = new impl.SchemaProvider(pool, testResources.schemaProviderTestVariables?.() )
    env.driver = driver
    if (impl.dataDriver) {
        env.dataDriver = impl.dataDriver()
    }
    env.cleanup = cleanup
}

export const dbTeardown = async() => {
    await env.cleanup()
    env.dataProvider = Uninitialized
    env.schemaProvider = Uninitialized
    env.driver = Uninitialized
}

const postgresTestEnvInit = async() => await dbInit(postgres)
const mysqlTestEnvInit = async() => await dbInit(mysql)
const spannerTestEnvInit = async() => await dbInit(spanner)
const firestoreTestEnvInit = async() => await dbInit(firestore)
const mssqlTestEnvInit = async() => await dbInit(mssql)
const mongoTestEnvInit = async() => await dbInit(mongo)
const airTableTestEnvInit = async() => await dbInit(airtable)
const dynamoTestEnvInit = async() => await dbInit(dynamo)
const bigqueryTestEnvInit = async() => await dbInit(bigquery)
const googleSheetTestEnvInit = async() => await dbInit(googleSheet)

const testSuits = {
    mysql: suiteDef('MySql', mysqlTestEnvInit, mysql.testResources.supportedOperations),
    postgres: suiteDef('Postgres', postgresTestEnvInit, postgres.testResources.supportedOperations),
    spanner: suiteDef('Spanner', spannerTestEnvInit, spanner.testResources.supportedOperations),
    firestore: suiteDef('Firestore', firestoreTestEnvInit, firestore.testResources.supportedOperations),
    mssql: suiteDef('Sql Server', mssqlTestEnvInit, mssql.testResources.supportedOperations),
    mongo: suiteDef('Mongo', mongoTestEnvInit, mongo.testResources.supportedOperations),
    airtable: suiteDef('Airtable', airTableTestEnvInit, airtable.testResources.supportedOperations),
    dynamodb: suiteDef('DynamoDb', dynamoTestEnvInit, dynamo.testResources.supportedOperations),
    bigquery: suiteDef('BigQuery', bigqueryTestEnvInit, bigquery.testResources.supportedOperations),
    'google-sheet': suiteDef('Google-Sheet', googleSheetTestEnvInit, googleSheet.supportedOperations),
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]
export const supportedOperations = testedSuit().supportedOperations
export const setupDb = () => testedSuit().setup()
export const currentDbImplementationName = () => testedSuit().name
