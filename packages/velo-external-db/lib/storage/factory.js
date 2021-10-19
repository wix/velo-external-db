const append = (res, secretKey) => Object.assign({}, res, {secretKey: secretKey})

const init = async(type, vendor, config) => {
    console.log(`INIT: ${vendor + '/' + type}`)
    switch ( type ) {
        case 'postgres': {
            const { init } = require('external-db-postgres')
            const cfg = await config.readConfig()

            return append(init(cfg), cfg.secretKey)
        }
        case 'spanner': {
            const { init } = require('external-db-spanner')

            const cfg = await config.readConfig()
            return append(init(cfg), cfg.secretKey)
        }
        case 'firestore': {
            const { init } = require('external-db-firestore')

            const { projectId, secretKey } = await config.readConfig()
            return append(init([projectId]), secretKey)
        }
        case 'mssql': {
            const { init } = require('external-db-mssql')

            const cfg = await config.readConfig()
            const res = await init(cfg)
            return append(res, cfg.secretKey)
        }
        case 'mysql':{
            const { init } = require('external-db-mysql')
            const cfg = await config.readConfig()

            return append(init(cfg), cfg.secretKey)
        }
        case 'mariadb':{
            const { init } = require('external-db-mariadb')
            const cfg = await config.readConfig()

            return append(init(cfg), cfg.secretKey)
        }
        case 'mongo': {
            const { init } = require('external-db-mongo')
            const cfg = await config.readConfig()

            return append(await init(cfg), cfg.secretKey)
        }
        case 'google-sheet': {
            const { init } = require('external-db-google-sheets')
            const cfg = await config.readConfig()
            return append(await init(cfg), cfg.secretKey)
        }
        case 'airtable': {
            const { init } = require('external-db-airtable')
            const cfg = await config.readConfig()
            return append(await init(cfg), cfg.secretKey)
        }
    }
}

module.exports = { init }