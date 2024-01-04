import { AwsMongoConfigReader } from '../../src/readers/aws_config_reader'
import { SecretsManagerClient, GetSecretValueCommand, ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-secrets-manager'
import * as mockClient from 'aws-sdk-client-mock'

import { validAuthorizationConfig, splitConfig } from '../test_utils'
import Chance = require('chance');
import { MongoAwsConfig, MongoConfig } from '../test_types'
const chance = new Chance()

let mockedAwsSdk: mockClient.AwsStub<ServiceInputTypes, ServiceOutputTypes> 

export const init = () => mockedAwsSdk = mockClient.mockClient(SecretsManagerClient)


export const defineValidConfig = (config: MongoConfig) => {
    const awsConfig: MongoAwsConfig = {}
    if (config.connectionUri) {
        awsConfig['URI'] = config.connectionUri
    }
    if (config.authorization) {
        awsConfig['PERMISSIONS'] = JSON.stringify( config.authorization )
    }
    if (config.jwtPublicKey) {
        awsConfig['JWT_PUBLIC_KEY'] = config.jwtPublicKey
    }
    if (config.appDefId) {
        awsConfig['APP_DEF_ID'] = config.appDefId
    }
    mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(awsConfig) })
}

const defineLocalEnvs = (config: MongoConfig) => {
    if (config.connectionUri) {
        process.env['URI'] = config.connectionUri
    }
    if (config.authorization) {
        process.env['PERMISSIONS'] = JSON.stringify( config.authorization )
    }
    if (config.jwtPublicKey) {
        process.env['JWT_PUBLIC_KEY'] = config.jwtPublicKey
    }
    if (config.appDefId) {
        process.env['APP_DEF_ID'] = config.appDefId
    }
}

export const defineInvalidConfig = () => defineValidConfig({})

export const validConfig = () => ({
    connectionUri: chance.word(),
    jwtPublicKey: chance.word(),
    appDefId: chance.word(),
})

export const defineSplittedConfig = (config: MongoConfig) => {
    const { firstPart: localConfigPart, secondPart: secretMangerPart } = splitConfig(config)
    defineValidConfig(localConfigPart)
    defineLocalEnvs(secretMangerPart)
}

export const validConfigWithAuthorization = () => ({
    ...validConfig(),
    authorization: validAuthorizationConfig.collectionPermissions 
})

export const ExpectedProperties = ['URI', 'PERMISSIONS', 'JWT_PUBLIC_KEY', 'APP_DEF_ID']
export const RequiredProperties = ['URI', 'JWT_PUBLIC_KEY', 'APP_DEF_ID']

export const reset = () => { 
    mockedAwsSdk.reset()
    ExpectedProperties.forEach(p => delete process.env[p])
}

export const defineErroneousConfig = (msg: any) => mockedAwsSdk.on(GetSecretValueCommand).rejects(new Error(msg || chance.word()))

export const configReaderProvider = new AwsMongoConfigReader(undefined, '')
export const hasReadErrors = false
