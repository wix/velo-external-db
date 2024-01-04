const { testResources: postgres } = require ('@wix-velo/external-db-postgres')
const { testResources: mysql } = require ('@wix-velo/external-db-mysql')
const { testResources: spanner } = require ('@wix-velo/external-db-spanner')
const { testResources: firestore } = require ('@wix-velo/external-db-firestore')
const { testResources: mssql } = require ('@wix-velo/external-db-mssql')
const { testResources: mongo } = require ('@wix-velo/external-db-mongo')
// const { testResources: googleSheet } = require('@wix-velo/external-db-google-sheets')
// const { testResources: airtable } = require('@wix-velo/external-db-airtable')
const { testResources: dynamo } = require('@wix-velo/external-db-dynamodb')
const { testResources: bigquery } = require('@wix-velo/external-db-bigquery')

const ci = require('./ci_utils')

const shutdownEnv = async(testEngine) => {
    switch (testEngine) {
        case 'mysql':
            await mysql.shutdownEnv()
            break

        case 'spanner':
            await spanner.shutdownEnv()
            break

        case 'postgres':
            await postgres.shutdownEnv()
            break

        case 'firestore':
            await firestore.shutdownEnv()
            break

        case 'mssql':
            await mssql.shutdownEnv()
            break

        // case 'google-sheet':
        //     await googleSheet.shutdownEnv()
        //     break

        // case 'airtable':
        //     await airtable.shutdownEnv()
        //     break
        
        case 'dynamodb':
            await dynamo.shutdownEnv()
            break

        case 'mongo': 
            await mongo.shutdownEnv()
            break
        
        case 'bigquery':
            await bigquery.shutdownEnv()
            break
    }
}

module.exports = async() => {
    const testEngine = process.env.TEST_ENGINE
    if (ci.LocalDev() || ci.engineWithoutDocker(testEngine)) {
        await shutdownEnv(testEngine)
    }
}
