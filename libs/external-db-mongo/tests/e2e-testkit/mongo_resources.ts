import * as compose from 'docker-compose'
import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'

export * as capabilities from '../../src/mongo_capabilities' 

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = await init({ connectionUri: 'mongodb://root:pass@localhost/testdb' })

    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = await init({ connectionUri: 'mongodb://root:pass@localhost/testdb' })

    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map( t => schemaProvider.drop(t) ))

    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('mongo', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const shutdownEnv = async() => {
    await compose.stopOne('mongo', { cwd: __dirname, log: true })
}

export const setActive = () => {
    process.env = { ...process.env, ...enviormentVariables }
}

export const enviormentVariables = {
    TYPE: 'mongo',
    URI: 'mongodb://root:pass@localhost/testdb'
}

export const name = 'mongo'
