const { AwsMongoConfigReader } = require('../../lib/readers/aws_config_reader')
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const mockClient = require('aws-sdk-client-mock')
let mockedAwsSdk
const { validAuthorizationConfig } = require ('../test_utils')

const Chance = require('chance')
const chance = new Chance()

const init = () => mockedAwsSdk = mockClient.mockClient(SecretsManagerClient)

const defineValidConfig = (config) => {
    const awsConfig = { }
    if (config.connectionUri) {
        awsConfig.URI = config.connectionUri
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
    connectionUri: chance.word(),
    secretKey: chance.word()
})

const validConfigWithAuthorization = () => ({
    ...validConfig(),
    authorization: validAuthorizationConfig.collectionLevelConfig 
})

const ExpectedProperties = ['URI', 'SECRET_KEY', 'ROLE_CONFIG']
const RequiredProperties = ['URI', 'SECRET_KEY']

const reset = () => { 
    mockedAwsSdk.reset()
    ExpectedProperties.forEach(p => delete process.env[p])
}

const defineErroneousConfig = (msg) => mockedAwsSdk.on(GetSecretValueCommand).rejects(new Error(msg || chance.word()))

module.exports = {
    init,
    defineValidConfig,
    validConfigWithAuthorization,
    defineInvalidConfig,
    defineErroneousConfig,
    validConfig,
    reset,
    hasReadErrors: true,
    ExpectedProperties,
    RequiredProperties,
    configReaderProvider: new AwsMongoConfigReader()
}

