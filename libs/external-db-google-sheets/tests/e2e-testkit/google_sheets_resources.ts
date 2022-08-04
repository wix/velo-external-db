import init from '../../src/connection_provider'
import * as serviceAccountKey from './service_account_key.json'
export { supportedOperations } from '../../src/supported_operations'

export const SHEET_ID = '18ZFGORJ8tF9pbnyb94P9Nm4VZ2WB4MoO8ZB_hqEaSgU'

export const connection = async() => {
    const googleSheetsConfig = {
        sheetId: SHEET_ID,
        clientEmail: serviceAccountKey.client_email,
        apiPrivateKey: serviceAccountKey.private_key
    }
    const { connection, schemaProvider, cleanup } = await init(googleSheetsConfig)
    return { pool: connection, schemaProvider, cleanup: cleanup }
}   

export const cleanup = async() => {
}

export const initEnv = async() => {    
    // _server = mockServer.listen(port)
}

export const shutdownEnv = async() => {
    // _server.close()
}

export const setActive = () => {
    process.env['TYPE'] = 'google-sheet'
    process.env['CLIENT_EMAIL'] = serviceAccountKey.client_email
    process.env['SHEET_ID'] = SHEET_ID
    process.env['API_PRIVATE_KEY'] = serviceAccountKey.private_key
}

export const name = 'google-sheets'
