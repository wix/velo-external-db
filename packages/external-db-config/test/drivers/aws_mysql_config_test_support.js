const { AwsConfigReader } = require('../../lib/readers/aws_config_reader')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const mockClient = require('aws-sdk-client-mock')
const mockedAwsSdk = mockClient.mockClient(SecretsManagerClient)

const Chance = require('chance')
const chance = new Chance()

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

const validAuthorizationConfig = {
    collectionLevelConfig: [
        {
            id: chance.word(),
            readPolicies: ['Admin'],
            writePolicies: ['Admin'],
        }
    ]
}

const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word(),
        clientDomain: chance.word()
    } 
})

const ExpectedProperties = ['host', 'username', 'password', 'DB', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'clientDomain', 'ROLE_CONFIG']

const reset = () => mockedAwsSdk.reset()

const defineErroneousConfig = (msg) => mockedAwsSdk.on(GetSecretValueCommand).rejects(new Error(msg || chance.word()))

const defaultConfig = {
    host: '',
    user: '',
    password: '',
    db: '',
    secretKey: '',
}

module.exports = {
    defineValidConfig,
    validConfigWithAuthConfig,
    validConfigWithAuthorization,
    defineInvalidConfig,
    defineErroneousConfig,
    validConfig,
    defaultConfig,
    reset,
    hasReadErrors: true,
    ExpectedProperties,
    configReaderProvider: new AwsConfigReader()
}

