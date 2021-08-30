const { AzrSecretsProvider } = require('../../lib/providers/azr_secret_provider')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.host) {
        process.env.HOST = config.host
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
    host: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    secretKey: chance.word(),
})

const ExpectedProperties = ['HOST', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY' ]

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])



module.exports = {
    defineValidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new AzrSecretsProvider()
}

