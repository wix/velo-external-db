import { Server } from 'http'
import { app as mockServer } from './wix_data_testkit'

let _server: Server
const PORT = 9001

export const initWixDataEnv = async() => {
    _server = mockServer.listen(PORT)
}

export const shutdownWixDataEnv = async() => {
    _server.close()
}

export const wixDataBaseUrl = () => {
    return `http://localhost:${PORT}`
}
