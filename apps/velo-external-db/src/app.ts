import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter, Hooks } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'


process.env.CLOUD_VENDOR = 'azure'
process.env.TYPE = 'mysql'
process.env.EXTERNAL_DATABASE_ID = ''
process.env.ALLOWED_METASITES = ''
process.env['TYPE'] = 'mysql'
process.env['HOST'] = 'localhost'
process.env['USER'] = 'test-user'
process.env['PASSWORD'] = 'password'
process.env['DB'] = 'test-db'

const initConnector = async(wixDataBaseUrl?: string, hooks?: Hooks) => {
    const { vendor, type: adapterType, externalDatabaseId, allowedMetasites } = readCommonConfig()
    const configReader = create()
    const { authorization, ...dbConfig } = await configReader.readConfig()

    const { connector: engineConnector, providers, cleanup } = await engineConnectorFor(adapterType, dbConfig)

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            authorization: {
                roleConfig: authorization
            },
            externalDatabaseId,
            allowedMetasites,
            vendor,
            adapterType,
            commonExtended: true,
            wixDataBaseUrl: wixDataBaseUrl || 'www.wixapis.com/wix-data'
        },
        hooks
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
