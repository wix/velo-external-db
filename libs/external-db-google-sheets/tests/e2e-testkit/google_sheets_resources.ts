const init = require('../../src/connection_provider')
const { app: mockServer } = require ('../mock_google_sheets_api')
import { Server } from 'http'
export { supportedOperations } from '../../src/supported_operations'

let _server: Server
const port = 1502

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init({ sheetId: 'test-sheet-id' })
    return { pool: connection, schemaProvider, cleanup: cleanup }
}   

export const cleanup = async() => {
    // todo: add cleanup logic
}

export const initEnv = async() => {    
    _server = mockServer.listen(port)
}

export const shutdownEnv = async() => {
    _server.close()
}

export const setActive = () => {
    process.env['TYPE'] = 'google-sheet'
    process.env['CLIENT_EMAIL'] = 'client-email'
    process.env['SHEET_ID'] = 'test-sheet-id'
    process.env['API_PRIVATE_KEY'] = 'test-api-key'
}

export const name = 'google-sheets'
