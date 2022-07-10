import { AwsConfigReader } from '../../src/readers/aws_config_reader'
import { SecretsManagerClient, GetSecretValueCommand, ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-secrets-manager'
import mockClient = require('aws-sdk-client-mock')
import { validAuthorizationConfig, splitConfig } from '../test_utils'
import * as Chance from 'chance'
import { AwsMysqlConfig, MySqlConfig } from '../test_types'
const chance = new Chance()


let mockedAwsSdk: mockClient.AwsStub<ServiceInputTypes, ServiceOutputTypes> 

export const init = () => mockedAwsSdk = mockClient.mockClient(SecretsManagerClient)


export const defineValidConfig = (config: MySqlConfig) => {
    const awsConfig: AwsMysqlConfig = { }
    if (config.host) {
        awsConfig['host'] = config.host
    }
    if (config.user) {
        awsConfig['username'] = config.user
    }
    if (config.password) {
        awsConfig['password'] = config.password
    }
    if (config.db) {
        awsConfig['DB'] = config.db
    }
    if (config.secretKey) {
        awsConfig['SECRET_KEY'] = config.secretKey
    }
    if (config.authorization) {
        awsConfig['PERMISSIONS'] = JSON.stringify(config.authorization)
    }
    mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(awsConfig) })
}

const defineLocalEnvs = (config: MySqlConfig) => {
    if (config.host) {
        process.env['HOST'] = config.host
    }
    if (config.user) {
        process.env['USER'] = config.user
    }
    if (config.password) {
        process.env['PASSWORD'] = config.password
    }
    if (config.db) {
        process.env['DB'] = config.db
    }
    if (config.secretKey) {
        process.env['SECRET_KEY'] = config.secretKey
    }
    if (config.authorization) {
        process.env['PERMISSIONS'] = JSON.stringify(config.authorization)
    }
}

export const defineSplittedConfig = (config: MySqlConfig) => {
    const { firstPart: localConfigPart, secondPart: secretMangerPart } = splitConfig(config)
    defineValidConfig(secretMangerPart)
    defineLocalEnvs(localConfigPart)
}


export const defineInvalidConfig = () => defineValidConfig({})

export const validConfig = (): MySqlConfig => ({
    host: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    secretKey: chance.word(),
})

export const validConfigWithAuthorization = (): MySqlConfig => ({
    ...validConfig(),
    authorization: validAuthorizationConfig  
})


export const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word(),
        clientDomain: chance.word()
    } 
})

export const ExpectedProperties = ['host', 'username', 'password', 'DB', 'SECRET_KEY', 'PERMISSIONS']
export const RequiredProperties = ['host', 'username', 'password', 'DB', 'SECRET_KEY']

export const reset = () => { 
    mockedAwsSdk.reset()
    ExpectedProperties.forEach(p => delete process.env[p])
    delete process.env['USER']
}

export const defineErroneousConfig = (msg: any) => mockedAwsSdk.on(GetSecretValueCommand).rejects(new Error(msg || chance.word()))
export const hasReadErrors = true
export const configReaderProvider = new AwsConfigReader('', undefined)
