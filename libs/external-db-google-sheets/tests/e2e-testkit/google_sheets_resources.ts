import init from '../../src/connection_provider'

export { supportedOperations } from '../../src/supported_operations'

export const SHEET_ID = '1rNU4Cr7rebYOn-QKpvwTdOxSo5Qf4VPNEyFqPAzBgFA'

export const connection = async() => {
    const googleSheetsConfig = {
        sheetId: SHEET_ID,
        clientEmail: process.env['CLIENT_EMAIL'],
        apiPrivateKey: process.env['API_PRIVATE_KEY']
    }
    const { connection, schemaProvider, cleanup } = await init(googleSheetsConfig)
    return { pool: connection, schemaProvider, cleanup: cleanup }
}   

export const cleanup = async() => {
}

export const initEnv = async() => { 
    if ( process.env['CI'] === undefined || process.env['CI'] === 'false') {
        const serviceAccountKey = require('./service_account_key.json')
        process.env['CLIENT_EMAIL'] = serviceAccountKey.client_email
        process.env['API_PRIVATE_KEY'] = serviceAccountKey.private_key
    }
}

export const shutdownEnv = async() => {
}

export const setActive = () => {
    process.env['TYPE'] = 'google-sheet'
    process.env['SHEET_ID'] = SHEET_ID
}

export const name = 'google-sheets'
