import * as compose from 'docker-compose'
import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'

export * as capabilities from '../../src/mssql_capabilities' 

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

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init(testEnvConfig, extraOptions)

    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = await init(testEnvConfig, extraOptions)

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('mssql', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const shutdownEnv = async() => {
    await compose.stopOne('mssql', { cwd: __dirname, log: true })
}

export const setActive = () => {
    process.env = { ...process.env, ...enviormentVariables, UNSECURED_ENV: 'true' }
}

export const enviormentVariables = {
    TYPE: 'mssql',
    HOST: 'localhost',
    USER: 'sa',
    PASSWORD: 't9D4:EHfU6Xgccs-',
    DB: 'tempdb',
}

export const name = 'mssql'
