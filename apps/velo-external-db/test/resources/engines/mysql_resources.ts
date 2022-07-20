import { init } from '@wix-velo/external-db-mysql'
import { runImage, stopImage } from './docker_support'
import { waitUntil } from 'async-wait-until'
export { supportedOperations } from '@wix-velo/external-db-mysql'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { connectionLimit: 1, queueLimit: 0 })
    return { pool: connection, schemaProvider, cleanup: cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, databaseOperations, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { connectionLimit: 1, queueLimit: 0 })
    await waitUntil(async() => (await databaseOperations.validateConnection()).valid)
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

export const initEnv = async() => {
    await runImage('mysql')
}

export const shutdownEnv = async() => {
    await stopImage('mysql')
}

export const setActive = () => {
    process.env.TYPE = 'mysql'
    process.env.HOST = 'localhost'
    process.env.USER = 'test-user'
    process.env.PASSWORD = 'password'
    process.env.DB = 'test-db'
}
