
import init from '../../src/connection_provider'
const { app: mockServer } = require ('../mock_google_sheets_api')
import { Server } from 'http'

export const SHEET_ID = '1rNU4Cr7rebYOn-QKpvwTdOxSo5Qf4VPNEyFqPAzBgFA'
const PORT = 1502

let _server: Server

export { supportedOperations } from '../../src/supported_operations'

export const connection = async() => {
    const googleSheetsConfig = {
        sheetId: SHEET_ID,
        clientEmail: process.env['CLIENT_EMAIL'],
        apiPrivateKey: process.env['API_PRIVATE_KEY']
    }
    const { connection, schemaProvider, cleanup } = await init(googleSheetsConfig)
    return { pool: connection, schemaProvider, cleanup }
}   

export const cleanup = async() => {
}

export const initEnv = async() => {
    _server = mockServer.listen(PORT) 
}

export const shutdownEnv = async() => {
    _server.close()
}

export const setActive = () => {
    process.env = { ...process.env, ...enviormentVariables }
}

export const enviormentVariables = {
    TYPE: 'google-sheet',
    SHEET_ID
}

export const name = 'google-sheets'
