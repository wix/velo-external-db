import { init } from '@wix-velo/external-db-postgres'
export { supportedOperations } from '@wix-velo/external-db-postgres'
import * as compose from 'docker-compose'

export const connection = () => {
    const { connection, schemaProvider, cleanup } = init({ host: 'localhost', user: 'test-user', password: 'password', db: 'test-db' }, { max: 1 })
    return { pool: connection, schemaProvider, cleanup: cleanup }
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
    process.env['TYPE'] = 'postgres'
    process.env['HOST'] = 'localhost'
    process.env['USER'] = 'test-user'
    process.env['PASSWORD'] = 'password'
    process.env['DB'] = 'test-db'
}

export const shutdownEnv = async() => {
    await compose.stopOne('postgres', { cwd: __dirname, log: true })
}

export const name = 'postgres'
