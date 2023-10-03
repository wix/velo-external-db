import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter, Hooks } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'


const initConnector = async(hooks?: Hooks) => {
    const { vendor, type: adapterType, hideAppInfo } = readCommonConfig()

    const configReader = create()
    const { authorization, secretKey, ...dbConfig } = await configReader.readConfig()

    const { connector: engineConnector, providers, cleanup } = await engineConnectorFor(adapterType, dbConfig)

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            authorization: {
                roleConfig: authorization
            },
            secretKey,
            vendor,
            adapterType,
            commonExtended: true,
            hideAppInfo
        },
        hooks,
    })

    return { externalDbRouter, cleanup: async() => await cleanup(), schemaProvider: providers.schemaProvider }
}

export const createApp = async() => {
    const app = express()
    const initConnectorResponse = await initConnector()
    app.use(initConnectorResponse.externalDbRouter.router)
    const port = process.env.PORT || 8080
    const server = app.listen(port, () => console.log(`Connector listening on port ${port}`))

    return { server, ...initConnectorResponse, reload: () => initConnector() }
}
