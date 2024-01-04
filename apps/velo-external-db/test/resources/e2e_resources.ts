import { createApp } from '../../src/app'

import { testResources as postgres } from '@wix-velo/external-db-postgres'
import { testResources as mysql } from '@wix-velo/external-db-mysql'
import { testResources as spanner } from '@wix-velo/external-db-spanner'
import { testResources as firestore } from '@wix-velo/external-db-firestore'
import { testResources as mssql } from '@wix-velo/external-db-mssql'
import { testResources as mongo } from '@wix-velo/external-db-mongo'
import { testResources as airtable } from '@wix-velo/external-db-airtable'
import { testResources as googleSheet } from '@wix-velo/external-db-google-sheets'
import { testResources as dynamo } from '@wix-velo/external-db-dynamodb'
import { testResources as bigquery } from '@wix-velo/external-db-bigquery'

import { E2EResources } from '@wix-velo/external-db-testkit'
import { Uninitialized } from '@wix-velo/test-commons'

import { initWixDataEnv, shutdownWixDataEnv, wixDataBaseUrl } from '../drivers/wix_data_resources'
import { E2E_ENV } from '../types'


export let env: E2E_ENV = {
    app: Uninitialized,
    internals: Uninitialized,
    externalDbRouter: Uninitialized,
    capabilities: Uninitialized,
    enviormentVariables: Uninitialized,
}

const createAppWithWixDataBaseUrl = createApp.bind(null, wixDataBaseUrl())

const testSuits = {
    mysql: new E2EResources(mysql, createAppWithWixDataBaseUrl),
    postgres: new E2EResources(postgres, createAppWithWixDataBaseUrl),
    spanner: new E2EResources(spanner, createAppWithWixDataBaseUrl),
    firestore: new E2EResources(firestore, createAppWithWixDataBaseUrl),
    mssql: new E2EResources(mssql, createAppWithWixDataBaseUrl),
    mongo: new E2EResources(mongo, createAppWithWixDataBaseUrl),
    'google-sheet': new E2EResources(googleSheet, createApp),
    airtable: new E2EResources(airtable, createApp),
    dynamodb: new E2EResources(dynamo, createAppWithWixDataBaseUrl),
    bigquery: new E2EResources(bigquery, createAppWithWixDataBaseUrl),
}

export const testedSuit = () => testSuits[process.env.TEST_ENGINE]
export const supportedOperations = testedSuit().supportedOperations

export const setupDb = async() => {
    await initWixDataEnv()
    await testedSuit().setUpDb()
}
export const currentDbImplementationName = () => testedSuit().currentDbImplementationName
export const initApp = async() => {
    env = await testedSuit().initApp()
    env.capabilities = testedSuit().implementation.capabilities
    env.enviormentVariables = testedSuit().implementation.enviormentVariables
}
export const teardownApp = async() => {
    await testedSuit().teardownApp()
    await shutdownWixDataEnv()
}
export const dbTeardown = async() => testedSuit().dbTeardown()
