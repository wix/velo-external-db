import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter, Hooks } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'

const initConnector = async(wixDataBaseUrl?: string, hooks?: Hooks) => {
    const { vendor, type: adapterType, allowedMetasites, hideAppInfo } = readCommonConfig()
    const configReader = create()
    const { authorization, jwtPublicKey, appDefId, ...dbConfig } = await configReader.readConfig()

    const { connector: engineConnector, providers, cleanup } = await engineConnectorFor(adapterType, dbConfig)

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            authorization: {
                roleConfig: authorization
            },
            jwtPublicKey,
            appDefId,
            allowedMetasites,
            vendor,
            adapterType,
            commonExtended: true,
            hideAppInfo,
            wixDataBaseUrl: wixDataBaseUrl || 'https://www.wixapis.com/wix-data'
        },
        hooks,
    })

    return { externalDbRouter, cleanup: async() => await cleanup(), schemaProvider: providers.schemaProvider }
}

export const createApp = async(wixDataBaseUrl?: string) => {
    const app = express()
    const initConnectorResponse = await initConnector(wixDataBaseUrl)
    app.use(initConnectorResponse.externalDbRouter.router)
    const server = app.listen(8080, () => console.log('Connector listening on port 8080'))

    return { server, ...initConnectorResponse, reload: () => initConnector(wixDataBaseUrl) }
}
