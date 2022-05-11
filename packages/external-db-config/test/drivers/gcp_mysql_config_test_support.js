const { GcpConfigReader } = require('../../lib/readers/gcp_config_reader')
const Chance = require('chance')
const chance = new Chance()
const { validAuthorizationConfig } = require ('../test_utils')

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
    cloudSqlConnectionName: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    secretKey: chance.word(),
})

const validConfigWithAuthorization = () => ({
    ...validConfig(),
    authorization: validAuthorizationConfig.collectionLevelConfig 
})

const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word(),
    }  
})

const ExpectedProperties = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'PERMISSIONS']

const defineInvalidConfig = () => defineValidConfig({})

const reset = () => {
    ExpectedProperties.forEach(p => delete process.env[p])
}


module.exports = {
    defineValidConfig,
    validConfigWithAuthConfig,
    validConfigWithAuthorization,
    defineInvalidConfig,
    ExpectedProperties,
    validConfig,
    reset,
    hasReadErrors: false,
    configReaderProvider: new GcpConfigReader()
}

