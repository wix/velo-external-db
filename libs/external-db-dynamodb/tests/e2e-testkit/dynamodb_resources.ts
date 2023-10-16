import * as compose from 'docker-compose'
import init from '../../src/connection_provider'
export { supportedOperations } from '../../src/supported_operations'
export * as capabilities from '../../src/dynamo_capabilities'

export const connection = async() => {
    const { connection, schemaProvider, cleanup } = init(connectionConfig(), accessOptions())

    return { pool: connection, schemaProvider, cleanup }
}

export const cleanup = async() => {
    const { schemaProvider, cleanup } = init(connectionConfig(), accessOptions())
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map(t => schemaProvider.drop(t)))
    await cleanup()
}

export const initEnv = async() => {
    await compose.upOne('dynamodb', { cwd: __dirname, log: true, commandOptions: [['--force-recreate', '--remove-orphans']] })
}

export const shutdownEnv = async() => {
    await compose.stopOne('dynamodb', { cwd: __dirname, log: true })
}

export const setActive = () => {
    process.env = { ...process.env, ...enviormentVariables }
}

export const enviormentVariables = {
    TYPE: 'dynamodb',
    REGION: 'us-west-2',
    AWS_SECRET_ACCESS_KEY: 'TestSecretAccessKey',
    AWS_ACCESS_KEY_ID: 'TestAccessKeyId',
    ENDPOINT_URL: 'http://localhost:8000'
}

const connectionConfig = () => ({ endpoint: 'http://localhost:8000',
                                  region: 'us-west-2',
                               })
const accessOptions = () => ({
                                credentials: { accessKeyId: 'TestAccessKeyId', secretAccessKey: 'TestSecretAccessKey' }
                            })

export const name = 'dynamodb'
