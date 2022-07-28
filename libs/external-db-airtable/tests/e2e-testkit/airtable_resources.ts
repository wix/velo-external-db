import { Server } from 'http'
import init from '../../src/connection_provider'
import { app as mockServer } from '../drivers/mock_air_table'
export { supportedOperations } from '../../src/supported_operations'

let _server: Server
const PORT = 9000

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init(connectionConfig(),
        { requestTimeout: 1000 })

    return { pool: connection, schemaProvider, cleanup: cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = await init(connectionConfig(),
        { requestTimeout: 1000 })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map(t => schemaProvider.drop(t)))
    await cleanup()
}

export const initEnv = async() => {
    _server = mockServer.listen(PORT)
}

export const shutdownEnv = async() => {
    _server.close()
}

export const setActive = () => {
    process.env['AIRTABLE_API_KEY'] = 'key123'
    process.env['META_API_KEY'] = 'meta123'
    process.env['TYPE'] = 'airtable'
    process.env['BASE_ID'] = 'app123'
    process.env['BASE_URL'] = 'http://localhost:9000'
}

export const schemaProviderTestVariables = () => (
    {
        apiKey: 'key123',
        metaApiKey: 'meta123',
        baseUrl: `http://localhost:${PORT}`
    }
)

const connectionConfig = () => ({ apiPrivateKey: 'key123', baseId: 'app123', metaApiKey: 'meta123',  baseUrl: `http://localhost:${PORT}` })

export const name = 'airtable'