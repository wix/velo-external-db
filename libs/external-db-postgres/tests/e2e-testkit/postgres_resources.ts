import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'
import * as compose from 'docker-compose'
export * as capabilities from '../../src/postgres_capabilities'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('postgres', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const setActive = () => {
    process.env = { ...process.env, ...enviormentVariables }
}

export const enviormentVariables = {
    TYPE: 'postgres',
    HOST: 'localhost',
    USER: 'test-user',
    PASSWORD: 'password',
    DB: 'test-db'
}


export const shutdownEnv = async() => {
    await compose.stopOne('postgres', { cwd: __dirname, log: true })
}

export const name = 'postgres'
