const express = require('express')
const { create, readCommonConfig } = require('@wix-velo/external-db-config')
const { ExternalDbRouter } = require('@wix-velo/velo-external-db-core')
const { engineConnectorFor } = require('./storage/factory')

let started = false
let server, _schemaProvider, _cleanup
let externalDbRouter




const initConnector = async(hooks) => {
    const { vendor, type: adapterType } = readCommonConfig()
    const configReader = create()
    const { authorization, secretKey, ...dbConfig } = await configReader.readConfig()

    const { connector: engineConnector, providers, cleanup } = await engineConnectorFor(adapterType, dbConfig)

    externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            authorization: {
                roleConfig: authorization
            },
            secretKey,
            vendor
        },
        hooks
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

    server = app.listen(8080, () => console.log('Connector listening on port 8080'))

    started = true
})

const internals = () => ({ server, schemaProvider: _schemaProvider, cleanup: _cleanup, started, reload: initConnector, externalDbRouter })

module.exports = { internals }
