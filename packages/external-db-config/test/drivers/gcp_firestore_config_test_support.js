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
    if (config.authorization) {
        process.env.ROLE_CONFIG = JSON.stringify({ collectionLevelConfig: config.authorization })
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
        clientSecret: chance.word(),
    }  
})

const defineInvalidConfig = () => defineValidConfig({})

const ExpectedProperties = ['PROJECT_ID', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'ROLE_CONFIG']

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
    configReaderProvider: new GcpFirestoreConfigReader()
}

