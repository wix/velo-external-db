const { AzureConfigReader } = require('../../lib/readers/azure_config_reader')
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
    if (config.authorization) {
        process.env.ROLE_CONFIG = JSON.stringify({ collectionLevelConfig: config.authorization })
    }
    if (config.auth?.clientId) {
        process.env.clientId = config.auth.clientId
    }
    if (config.auth?.clientSecret) {
        process.env.clientSecret = config.auth.clientSecret
    }
    if (config.auth?.callbackUrl) {
        process.env.callbackUrl = config.auth.callbackUrl
    } 
}

const validConfig = () => ({
    host: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    secretKey: chance.word(),
})

const validConfigWithAuthorization = () => ({
    ...validConfig(),
    authorization: validAuthorizationConfig.collectionLevelConfig 
})

const validAuthorizationConfig = {
    collectionLevelConfig: [
        {
            id: chance.word(),
            readPolicies: ['OWNER'],
            writePolicies: ['BACKEND_CODE'],
        }
    ]
}

const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word()
    }  
})

const defineInvalidConfig = () => defineValidConfig({})

const ExpectedProperties = ['HOST', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'ROLE_CONFIG']

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])



module.exports = {
    defineValidConfig,
    validConfigWithAuthConfig,
    validConfigWithAuthorization,
    defineInvalidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new AzureConfigReader()
}

