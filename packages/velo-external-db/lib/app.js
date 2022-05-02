const express = require('express')
const { create, readCommonConfig } = require('external-db-config')
const { ExternalDbRouter } = require('velo-external-db-core')
const { engineConnectorFor } = require('./storage/factory')

let started = false
let server, _schemaProvider, _cleanup

const initConnector = async() => {
    const { vendor, type: adapterType } = readCommonConfig()
    const configReader = create()
    const config = await configReader.readConfig()

    const { connector: engineConnector, providers, cleanup } = await engineConnectorFor(adapterType, config)

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            authorization: {
                roleConfig: {
                    collectionLevelConfig: config.authorization
                }
            },
            secretKey: config.secretKey,
            vendor
        },
        hooks: {
        }
    })

    _cleanup = async() => {
        await cleanup()
    }
    _schemaProvider = providers.schemaProvider
    
    return { externalDbRouter }
}

initConnector().then(({ externalDbRouter }) => {
    const app = express()
    app.use(externalDbRouter.router)
    externalDbRouter.enableAppInfo(app)

    server = app.listen(8080, () => console.log('Connector listening on port 8080'))

    started = true
})

const internals = () => ({ server, schemaProvider: _schemaProvider, cleanup: _cleanup, started, reload: initConnector })

module.exports = { internals }
