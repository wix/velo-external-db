const { GcpFirestoreConfigReader } = require('../../lib/readers/gcp_config_reader')
const Chance = require('chance')
const chance = new Chance()
const { validAuthorizationConfig } = require ('../test_utils')

const defineValidConfig = (config) => {
    if (config.projectId) {
        process.env.PROJECT_ID = config.projectId
    }
    if (config.secretKey) {
        process.env.SECRET_KEY = config.secretKey
    }
    if (config.authorization) {
        process.env.PERMISSIONS = JSON.stringify( config.authorization )
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
    authorization: validAuthorizationConfig.collectionPermissions 
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

const ExpectedProperties = ['PROJECT_ID', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'PERMISSIONS']

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

