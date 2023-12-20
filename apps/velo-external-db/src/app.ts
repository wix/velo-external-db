import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter, Hooks, DataHooks, DataPayloadBefore, RequestContext, ServiceContext } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'

const initConnector = async(wixDataBaseUrl?: string, hooks?: Hooks) => {
    const { vendor, type: adapterType, hideAppInfo } = readCommonConfig()
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
    const hooks: Hooks = process.env.DEBUG ? { dataHooks: debuggingDataHooks } : undefined
    const initConnectorResponse = await initConnector(wixDataBaseUrl, hooks)
    app.use(initConnectorResponse.externalDbRouter.router)
    const server = app.listen(8080, () => console.log('Connector listening on port 8080'))

    return { server, ...initConnectorResponse, reload: () => initConnector(wixDataBaseUrl) }
}


const debuggingDataHooks: DataHooks = {
    beforeAll: (payload: DataPayloadBefore, requestContext: RequestContext, _serviceContext: ServiceContext, customContext: any) => {
        const startTime = Date.now()
        customContext.startTime = startTime
        customContext.payload = payload
        customContext.requestContext = requestContext
    },

    afterAll: (_payload: DataPayloadBefore, _requestContext: RequestContext, _serviceContext: ServiceContext, customContext: any) => {
        const endTime = Date.now()
        const startTime = customContext.startTime
        const duration = endTime - startTime
        console.log({ duration, payload: customContext.payload, requestContext: customContext.requestContext })
    }
}
