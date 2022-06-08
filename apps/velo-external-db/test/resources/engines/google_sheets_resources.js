const { init, mockServer, supportedOperations } = require('@wix-velo/external-db-google-sheets')

let _server, port = 1502

const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init({ sheetId: 'test-sheet-id' })
    return { pool: connection, schemaProvider, cleanup: cleanup }
}   

const cleanup = async() => {
    // todo: add cleanup logic
}

const initEnv = async() => {
    _server = mockServer.listen(port)
}

const shutdownEnv = async() => {
    _server.close()
}

const setActive = () => {
    process.env.TYPE = 'google-sheet'
    process.env.CLIENT_EMAIL = 'client-email'
    process.env.SHEET_ID = 'test-sheet-id'
    process.env.API_PRIVATE_KEY = 'test-api-key'
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup, supportedOperations }