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
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { Server } from 'http'
import { ConnectionCleanUp, ISchemaProvider } from '@wix-velo/velo-external-db-types'

interface App {
    server: Server;
    schemaProvider: ISchemaProvider;
    cleanup: ConnectionCleanUp;
    started: boolean;
    reload: (hooks?: any) => Promise<{
        externalDbRouter: ExternalDbRouter;
    }>;
    externalDbRouter: ExternalDbRouter;
}

type Internals = () => App

export let env:{
    app: App,
    externalDbRouter: ExternalDbRouter,
    internals: Internals,
    enviormentVariables: Record<string, string>
} = {
    app: Uninitialized,
    internals: Uninitialized,
    externalDbRouter: Uninitialized,
    enviormentVariables: Uninitialized
}

const testSuits = {
    mysql: new E2EResources(mysql, createApp),
    postgres: new E2EResources(postgres, createApp),
    spanner: new E2EResources(spanner, createApp),
    firestore: new E2EResources(firestore, createApp),
    mssql: new E2EResources(mssql, createApp),
    mongo: new E2EResources(mongo, createApp),
    'google-sheet': new E2EResources(googleSheet, createApp),
    airtable: new E2EResources(airtable, createApp),
    dynamodb: new E2EResources(dynamo, createApp),
    bigquery: new E2EResources(bigquery, createApp),
}

export const testedSuit = () => testSuits[process.env.TEST_ENGINE]
export const supportedOperations = testedSuit().supportedOperations

export const setupDb = () => testedSuit().setUpDb()
export const currentDbImplementationName = () => testedSuit().currentDbImplementationName
export const initApp = async() => {
    env = await testedSuit().initApp()
    env.enviormentVariables = testedSuit().implementation.enviormentVariables
}
export const teardownApp = async() => testedSuit().teardownApp()
export const dbTeardown = async() => testedSuit().dbTeardown()
