const { init, schemaSupportedOperations } = require('external-db-dynamodb')
const { runImage, stopImage } = require('./docker_support')

const connection = async() => {
    const { connection, cleanup } = await init(connectionConfig(), accessOptions())

    return { pool: connection, cleanup: cleanup }
}

const cleanup = async() => {
    const { schemaProvider, cleanup } = await init(connectionConfig(), accessOptions())
    const tables = await schemaProvider.list()
    await Promise.all(tables.map(t => t.id).map(t => schemaProvider.drop(t)))
    await cleanup()
}

const initEnv = async() => {
    await runImage('dynamodb')
}

const shutdownEnv = async() => {
    await stopImage('dynamodb')
}

const setActive = () => {
    process.env.TYPE = 'dynamodb'
    process.env.REGION = 'us-west-2'
    process.env.AWS_SECRET_ACCESS_KEY = 'TEST_SECRET_ACCESS_KEY'
    process.env.AWS_ACCESS_KEY_ID = 'TEST_ACCESS_KEY_ID'
    process.env.ENDPOINT_URL = 'http://localhost:8000'
}

const connectionConfig = () => ({ endpoint: 'http://localhost:8000',
                                  region: 'us-west-2',
                               })
const accessOptions = () => ({
                                credentials: { accessKeyId: 'TEST_ACCESS_KEY_ID', secretAccessKey: 'TEST_SECRET_ACCESS_KEY' }
                            })

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup, schemaSupportedOperations }