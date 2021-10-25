const { init, mockServer, cleanup: cleanupAirtable } = require('external-db-airtable')

let _server
const PORT = 9000

const connection = async () => {
    const { connection, cleanup } = await init({ apiPrivateKey: 'key123', baseId: 'app123' },
                                                {endpointUrl: 'http://localhost:'+PORT, requestTimeout: 1000})

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async () => {
    const { schemaProvider, cleanup } = await init({ apiPrivateKey: 'key123', baseId: 'app123' },
                                                {endpointUrl: 'http://localhost:'+PORT, requestTimeout: 1000})

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup();
}

const initEnv = async () => {
    _server = mockServer.listen(PORT)
}

const shutdownEnv = async () => {
    _server.close()
}

const setActive = () => {
    process.env.AIRTABLE_API_KEY = 'key123'
    process.env.META_API_KEY = 'meta123'
    process.env.TYPE = 'airtable'
    process.env.BASE_ID = 'app123'
    process.env.BASE_URL = 'http://localhost:9000'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }