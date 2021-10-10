const { init } = require('external-db-airtable')
const { runImage, stopImage } = require('./docker_support')
const axios = require('axios')

const connection = async () => {
    const { connection, cleanup } = await init({privateApiKey:process.env.AIRTABLE_API_KEY,baseId:process.env.BASE_ID})

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async () => {
    // await axios.post(`/data/truncate`, {collectionName: 'Table1' }, authAdmin)
}

const initEnv = async () => {
    // await runImage('mongo')
}

const shutdownEnv = async () => {
    // await stopImage('mongo')
}

const setActive = () => {
    process.env.AIRTABLE_API_KEY = ''
    process.env.TYPE = 'airtable'
    process.env.BASE_ID = ''
}



module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }