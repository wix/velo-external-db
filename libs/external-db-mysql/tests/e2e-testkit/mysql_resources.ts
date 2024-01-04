import * as compose from 'docker-compose'
import { waitUntil } from 'async-wait-until'
import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'

export * as capabilities from '../../src/mysql_capabilities' 

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { connectionLimit: 1, queueLimit: 0 })
    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, databaseOperations, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { connectionLimit: 1, queueLimit: 0 })
    await waitUntil(async() => (await databaseOperations.validateConnection()).valid)
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('mysql', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const shutdownEnv = async() => {
    await compose.stopOne('mysql', { cwd: __dirname, log: true })
}

export const setActive = () => {
    process.env = { ...process.env, ...enviormentVariables }
}

export const enviormentVariables = {
    TYPE: 'mysql',
    HOST: 'localhost',
    USER: 'test-user',
    PASSWORD: 'password',
    DB: 'test-db'
}

export const name = 'mysql'
