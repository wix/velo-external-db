// path aliases within jest global setup/teardown
import { registerTsProject } from 'nx/src/utils/register'
registerTsProject('.', 'tsconfig.base.json')


const { testResources: postgres } = require ('@wix-velo/external-db-postgres')
const { testResources: mysql } = require ('@wix-velo/external-db-mysql')
const { testResources: spanner } = require ('@wix-velo/external-db-spanner')
const { testResources: firestore } = require ('@wix-velo/external-db-firestore')
const { testResources: mssql } = require ('@wix-velo/external-db-mssql')
const { testResources: mongo } = require ('@wix-velo/external-db-mongo')
// const { testResources: googleSheet } = require('@wix-velo/external-db-google-sheets')
// const { testResources: airtable } = require('@wix-velo/external-db-airtable')
const { testResources: dynamoDb } = require('@wix-velo/external-db-dynamodb')
const { testResources: bigquery } = require('@wix-velo/external-db-bigquery')

const { sleep } = require('@wix-velo/test-commons')
const ci = require('./ci_utils')

const initEnv = async(testEngine) => {
    switch (testEngine) {
        case 'mysql':
            await mysql.initEnv()
            break

        case 'spanner':
            await spanner.initEnv()
            break

        case 'postgres':
            await postgres.initEnv()
            break

        case 'firestore':
            await firestore.initEnv()
            break

        case 'mssql':
            await mssql.initEnv()
            break

        case 'mongo':
            await mongo.initEnv()
            break
        // case 'google-sheet':
        //     await googleSheet.initEnv()
        //     break

        // case 'airtable':
        //     await airtable.initEnv()
        //     break
        
        case 'dynamodb':
            await dynamoDb.initEnv()
            break

        case 'bigquery':
            await bigquery.initEnv()
            break
    }
}

const cleanup = async(testEngine) => {
    switch (testEngine) {
        case 'mysql':
            await mysql.cleanup()
            break

        case 'spanner':
            await spanner.cleanup()
            break

        case 'postgres':
            await postgres.cleanup()
            break

        case 'firestore':
            await firestore.cleanup()
            break

        case 'mssql':
            await mssql.cleanup()
            break

        // case 'google-sheet':
        //     await googleSheet.cleanup()
        //     break

        case 'mongo':
            await mongo.cleanup()
            break
        
        case 'dynamodb':
            await dynamoDb.cleanup()
            break

        case 'bigquery':
            await bigquery.cleanup()
            break
    }
}

module.exports = async() => {
    const testEngine = process.env.TEST_ENGINE
    if (ci.LocalDev() || ci.engineWithoutDocker(testEngine)) {
        await initEnv(testEngine)

        await sleep(5000)
    }


    await cleanup(testEngine)
}
