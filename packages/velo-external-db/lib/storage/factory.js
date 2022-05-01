const append = (res, secretKey) => ( { ...res, secretKey: secretKey } )


const engineConnectorFor = async(type, config) => {
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
            return require('external-db-firestore')
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
            return require('external-db-google-sheets')
        }
        case 'airtable': {
            const { airtableFactory } = require('external-db-airtable')
            return await airtableFactory(config)
        }
        case 'dynamodb': {
            return require('external-db-dynamodb')
        }
        case 'bigquery': {
            return require('external-db-bigquery')
        }
        default: {
            return require('./stub-db/init')
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