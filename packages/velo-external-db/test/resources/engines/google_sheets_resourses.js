const { init, mockServer } = require('external-db-google-sheets')

let _server, port = 1502

const connection = () => {
    const { changeUrl } = init({sheetId: 'test-sheet-id', clientEmail: 'client-email', apiPrivateKey: 'test-api-key'})
    changeUrl('http://localhost:1502/v4/spreadsheets/$test-sheet-id')
}   

const cleanup = async() => {
    // clean all the sheets (if exists)
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

initEnv()

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }