import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'
import { Hooks } from 'libs/velo-external-db-core/src/types'

const initConnector = async (hooks?: Hooks) => {
    const { vendor, type: adapterType } = readCommonConfig()
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
            commonExtended: true
        },
        hooks
    })

    return { externalDbRouter, cleanup: async () => await cleanup(), schemaProvider: providers.schemaProvider }
}

export const createApp = async () => {
    const app = express()
    const initConnectorResponse = await initConnector()
    app.use(initConnectorResponse.externalDbRouter.router)
    const server = app.listen(8080, () => console.log('Connector listening on port 8080'))

    return { server, ...initConnectorResponse, reload: () => initConnector() }
}