import { Uninitialized, sleep } from '@wix-velo/test-commons'
import { suiteDef } from './test_suite_definition'
import { authInit } from '../drivers/auth_test_support'
import { waitUntil } from 'async-wait-until'

import * as postgres from'./engines/postgres_resources'
import * as mysql from'./engines/mysql_resources'
import * as spanner from'./engines/spanner_resources'
import * as firestore from'./engines/firestore_resources'
import * as mssql from'./engines/mssql_resources'
import * as mongo from'./engines/mongo_resources'
import * as airtable from'./engines/airtable_resources'
import * as dynamo from'./engines/dynamodb_resources'
import * as bigquery from'./engines/bigquery_resources'
import { Server } from 'http'
import { ConnectionCleanUp, ISchemaProvider } from '@wix-velo/velo-external-db-types'
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { createApp } from 'velo-external-db'
// const googleSheet = require('./engines/google_sheets_resources')

interface App {
    server: Server;
    schemaProvider: ISchemaProvider;
    cleanup: ConnectionCleanUp;
    reload: (hooks?: any) => Promise<{
        externalDbRouter: ExternalDbRouter;
    }>;
    externalDbRouter: ExternalDbRouter;
}

type Internals = () => App

export const env:{
    app: App,
    externalDbRouter: ExternalDbRouter,
    internals: Internals
} = {
    app: Uninitialized,
    internals: Uninitialized,
    externalDbRouter: Uninitialized
}

export const initApp = async() => {
    process.env.CLOUD_VENDOR = 'azure'
    if (env.app) {
        await env.app.server.close()
    }
    authInit()
    env.app = await createApp()
    env.externalDbRouter = env.app.externalDbRouter
}

export const teardownApp = async() => {
    await sleep(500)
    await env.app.server.close()
}

const dbInit = async impl => {
    await impl.cleanup()
    impl.setActive()
}

export const dbTeardown = async() => {
    await env.app.cleanup()
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
// const googleSheetTestEnvInit = async() => await dbInit(googleSheet)

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
    // 'google-sheet': suiteDef('Google-sheet', googleSheetTestEnvInit, googleSheet.supportedOperations),
}

const testedSuit = () => testSuits[process.env.TEST_ENGINE]
export const supportedOperations = testedSuit().supportedOperations

export const setupDb = () => testedSuit().setup()
export const currentDbImplementationName = () => testedSuit().name
