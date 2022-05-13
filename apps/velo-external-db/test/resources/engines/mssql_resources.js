const { init, supportedOperations } = require('external-db-mssql')
const { runImage, stopImage } = require('./docker_support')

const testEnvConfig = {
    host: 'localhost',
    user: 'sa',
    password: 't9D4:EHfU6Xgccs-',
    db: 'tempdb',
    unsecuredEnv: 'true',
}

const extraOptions = {
    pool: {
        max: 1,
        min: 0,
        idleTimeoutMillis: 30000
    },
}

const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init(testEnvConfig, extraOptions)

    return { pool: connection, schemaProvider, cleanup: cleanup }
}

const cleanup = async() => {
    const { schemaProvider, cleanup } = await init(testEnvConfig, extraOptions)

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

const initEnv = async() => {

    await runImage('mssql')
}

const shutdownEnv = async() => {
    await stopImage('mssql')
}

const setActive = () => {
    process.env.TYPE = 'mssql'
    process.env.HOST = 'localhost'
    process.env.USER = 'sa'
    process.env.PASSWORD = 't9D4:EHfU6Xgccs-'
    process.env.DB = 'tempdb'
    process.env.UNSECURED_ENV = 'true'
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup, supportedOperations }