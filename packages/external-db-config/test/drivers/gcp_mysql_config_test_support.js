const { GcpSecretProvider } = require('../../lib/readers/gcp_secret_provider')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.cloudSqlConnectionName) {
        process.env.CLOUD_SQL_CONNECTION_NAME = config.cloudSqlConnectionName
    }
    if (config.user) {
        process.env.USER = config.user
    }
    if (config.password) {
        process.env.PASSWORD = config.password
    }
    if (config.db) {
        process.env.DB = config.db
    }
    if (config.secretKey) {
        process.env.SECRET_KEY = config.secretKey
    }
}

const validConfig = () => ({
    cloudSqlConnectionName: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    secretKey: chance.word(),
})

const ExpectedProperties = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY']

const reset = () => {
    ExpectedProperties.forEach(p => delete process.env[p])
}


module.exports = {
    defineValidConfig,
    ExpectedProperties,
    validConfig,
    reset,
    hasReadErrors: false,
    configReaderProvider: new GcpSecretProvider()
}

