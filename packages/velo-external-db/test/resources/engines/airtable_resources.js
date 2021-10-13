const { init, mockServer, cleanup: cleanupAirtable } = require('external-db-airtable')
const { runImage, stopImage } = require('./docker_support')
const axios = require('axios')

let _server
const PORT = 9000

const connection = async () => {
    const { connection, cleanup } = await init({ privateApiKey: process.env.AIRTABLE_API_KEY, baseId: process.env.BASE_ID },
                                                {endpointUrl: 'http://localhost:'+PORT, requestTimeout: 1000})

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async () => {
    cleanupAirtable()
    // await axios.post(`/data/truncate`, {collectionName: 'Table1' }, authAdmin)
}

const initEnv = async () => {
    _server = mockServer.listen(PORT)
}

const shutdownEnv = async () => {
    _server.close()
}

const setActive = () => {
    process.env.AIRTABLE_API_KEY = 'key123'
    process.env.TYPE = 'airtable'
    process.env.BASE_ID = 'app123'
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }