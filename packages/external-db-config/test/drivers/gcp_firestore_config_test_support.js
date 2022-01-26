const { GcpFirestoreConfigReader } = require('../../lib/readers/gcp_config_reader')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.projectId) {
        process.env.PROJECT_ID = config.projectId
    }
    if (config.secretKey) {
        process.env.SECRET_KEY = config.secretKey
    }
    if (config.auth?.callbackUrl) {
        process.env.callbackUrl = config.auth.callbackUrl
    }
    if (config.auth?.clientId) {
        process.env.clientId = config.auth.clientId
    }
    if (config.auth?.clientSecret) {
        process.env.clientSecret = config.auth.clientSecret
    }
}

const validConfig = () => ({
    projectId: chance.word(),
    secretKey: chance.word(),
})

const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word(),
    }  
})

const defineInvalidConfig = () => defineValidConfig({})

const ExpectedProperties = ['PROJECT_ID', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret']

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

module.exports = {
    defineValidConfig,
    validConfigWithAuthConfig,
    defineInvalidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new GcpFirestoreConfigReader()
}

