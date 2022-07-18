import express = require('express')
import { create, readCommonConfig } from '@wix-velo/external-db-config'
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { engineConnectorFor } from './storage/factory'
import { Server } from 'http'
import { ConnectionCleanUp, ISchemaProvider } from '@wix-velo/velo-external-db-types'
import { DataHooks, SchemaHooks } from 'libs/velo-external-db-core/src/types'

let started = false
let server: Server, _schemaProvider: ISchemaProvider, _cleanup: ConnectionCleanUp
let externalDbRouter: ExternalDbRouter



const initConnector = async (hooks?: { dataHooks: DataHooks, schemaHooks: SchemaHooks }) => {
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
            vendor,
            adapterType,
            commonExtended: true
        },
        hooks
    })

    _cleanup = async () => {
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

export const internals = () => ({ server, schemaProvider: _schemaProvider, cleanup: _cleanup, started, reload: initConnector, externalDbRouter })
