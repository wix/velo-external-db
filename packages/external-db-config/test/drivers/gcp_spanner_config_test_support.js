const { GcpSpannerConfigReader } = require('../../lib/readers/gcp_config_reader')
const Chance = require('chance')
const chance = new Chance()

const defineValidConfig = (config) => {
    if (config.projectId) {
        process.env.PROJECT_ID = config.projectId
    }
    if (config.instanceId) {
        process.env.INSTANCE_ID = config.instanceId
    }
    if (config.databaseId) {
        process.env.DATABASE_ID = config.databaseId
    }
    if (config.secretKey) {
        process.env.SECRET_KEY = config.secretKey
    }
    if (config.roleConfig) {
        process.env.ROLE_CONFIG = config.roleConfig
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
    instanceId: chance.word(),
    databaseId: chance.word(),
    secretKey: chance.word(),
})

const validConfigWithAuthorization = () => ({
    ...validConfig(),
    roleConfig: {
        collectionLevelConfig: [
            {
                id: chance.word(),
                readPolicies: ['OWNER'],
                writePolicies: ['BACKEND_CODE'],
            }
        ]
    }
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

const ExpectedProperties = ['PROJECT_ID', 'INSTANCE_ID', 'DATABASE_ID', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret']

const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

module.exports = {
    defineValidConfig,
    validConfigWithAuthorization,
    validConfigWithAuthConfig,
    defineInvalidConfig,
    validConfig,
    reset,
    hasReadErrors: false,
    ExpectedProperties,
    configReaderProvider: new GcpSpannerConfigReader()
}

