const { AwsConfigReader } = require('../../lib/readers/aws_config_reader')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const mockClient = require('aws-sdk-client-mock')
let mockedAwsSdk 
const { validAuthorizationConfig } = require ('../test_utils')

const Chance = require('chance')
const chance = new Chance()

const init = () => mockedAwsSdk = mockClient.mockClient(SecretsManagerClient)

const defineValidConfig = (config) => {
    const awsConfig = { }
    if (config.host) {
        awsConfig.host = config.host
    }
    if (config.user) {
        awsConfig.username = config.user
    }
    if (config.password) {
        awsConfig.password = config.password
    }
    if (config.db) {
        awsConfig.DB = config.db
    }
    if (config.secretKey) {
        awsConfig.SECRET_KEY = config.secretKey
    }
    if (config.authorization) {
        awsConfig.ROLE_CONFIG = JSON.stringify({ collectionLevelConfig: config.authorization })
    }
    mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(awsConfig) })
}

const defineInvalidConfig = () => defineValidConfig({})

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


const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word(),
        clientDomain: chance.word()
    } 
})

const ExpectedProperties = ['host', 'username', 'password', 'DB', 'SECRET_KEY', 'ROLE_CONFIG']
const RequiredProperties = ['host', 'username', 'password', 'DB', 'SECRET_KEY']

const reset = () => { 
    mockedAwsSdk.reset()
    ExpectedProperties.forEach(p => delete process.env[p])
    delete process.env['USER']
}

const defineErroneousConfig = (msg) => mockedAwsSdk.on(GetSecretValueCommand).rejects(new Error(msg || chance.word()))

module.exports = {
    init,
    defineValidConfig,
    validConfigWithAuthConfig,
    validConfigWithAuthorization,
    defineInvalidConfig,
    defineErroneousConfig,
    validConfig,
    reset,
    hasReadErrors: true,
    ExpectedProperties,
    RequiredProperties,
    configReaderProvider: new AwsConfigReader()
}

