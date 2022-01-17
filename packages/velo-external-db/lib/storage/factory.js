const append = (res, secretKey) => ( { ...res, secretKey: secretKey } )

const init = async(type, vendor, config) => {
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
    }
}

module.exports = { init }