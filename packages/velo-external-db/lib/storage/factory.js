const append = (res, secretKey) => ( { ...res, secretKey: secretKey } )


const engineConnectorFor = async(_type, config) => {
    const type = _type || ''
    switch ( type.toLowerCase() ) {
        case 'postgres': {
            const { postgresFactory } = require('external-db-postgres')
            return await postgresFactory(config)
        }
        case 'spanner': {
            const { spannerFactory } = require('external-db-spanner')
            return await spannerFactory(config)
        }
        case 'firestore': {
            const { firestoreFactory } = require('external-db-firestore')
            return await firestoreFactory(config)
        }
        case 'mssql': {
            const { mssqlFactory } = require('external-db-mssql')
            return await mssqlFactory(config)
        }
        case 'mysql': {
            const { mySqlFactory } = require('external-db-mysql')
            return await mySqlFactory(config)
        }
        case 'mongo': {
            const { mongoFactory } = require('external-db-mongo')
            return await mongoFactory(config)
        }
        case 'google-sheet': {
            const { googleSheetFactory } = require('external-db-google-sheets')
            return await googleSheetFactory(config)
        }
        case 'airtable': {
            const { airtableFactory } = require('external-db-airtable')
            return await airtableFactory(config)
        }
        case 'dynamodb': {
            const { dynamoDbFactory } = require('external-db-dynamodb')
            return await dynamoDbFactory(config)
        }
        case 'bigquery': {
            const { bigqueryFactory } = require('external-db-bigquery')
            return await bigqueryFactory(config)
        }
        default: {
            const { stubFactory } = require('./stub-db/stub-connector')
            return await stubFactory(type, config)
        }
    }
}


const init = async(_type, vendor, config) => {
    const type = _type || ''
    console.log(`INIT: ${vendor + '/' + type}`)
    const cfg = await config.readConfig()
    switch ( type.toLowerCase() ) {
        case 'postgres': {
            const { init } = require('external-db-postgres')

            return append(init(cfg), cfg.secretKey)
        }
        case 'spanner': {
            const { init } = require('external-db-spanner')

            return append(init(cfg), cfg.secretKey)
        }
        case 'firestore': {
            const { init } = require('external-db-firestore')

            const { projectId, secretKey } = cfg
            return append(init([projectId]), secretKey)
        }
        case 'mssql': {
            const { init } = require('external-db-mssql')

            const res = await init(cfg)
            return append(res, cfg.secretKey)
        }
        case 'mysql': {
            const { init } = require('external-db-mysql')

            return append(init(cfg), cfg.secretKey)
        }
        case 'mongo': {
            const { init } = require('external-db-mongo')

            return append(await init(cfg), cfg.secretKey)
        }
        case 'google-sheet': {
            const { init } = require('external-db-google-sheets')
            return append(await init(cfg), cfg.secretKey)
        }
        case 'airtable': {
            const { init } = require('external-db-airtable')
            return append(await init(cfg), cfg.secretKey)
        }
        case 'dynamodb': {
            const { init } = require('external-db-dynamodb')
            return append(await init(cfg), cfg.secretKey)
        }
        case 'bigquery': {
            const { init } = require('external-db-bigquery')
            return append(await init(cfg), cfg.secretKey)
        }
        default: {
            const init = require('./stub-db/init')
            return append(await init(type), cfg.secretKey)
        }
    }
}

module.exports = { init, engineConnectorFor }