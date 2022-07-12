import { GcpFirestoreConfigReader } from '../../src/readers/gcp_config_reader'
import * as Chance from 'chance'
import { validAuthorizationConfig } from '../test_utils'
import { FiresStoreConfig } from '../test_types'
const chance = new Chance()

export const defineValidConfig = (config: FiresStoreConfig) => {
    if (config.projectId) {
        process.env['PROJECT_ID'] = config.projectId
    }
    if (config.secretKey) {
        process.env['SECRET_KEY'] = config.secretKey
    }
    if (config.authorization) {
        process.env['PERMISSIONS'] = JSON.stringify( config.authorization )
    }
    if (config.auth?.callbackUrl) {
        process.env['callbackUrl'] = config.auth.callbackUrl
    }
    if (config.auth?.clientId) {
        process.env['clientId'] = config.auth.clientId
    }
    if (config.auth?.clientSecret) {
        process.env['clientSecret'] = config.auth.clientSecret
    }
}

export const validConfig = (): FiresStoreConfig => ({
    projectId: chance.word(),
    secretKey: chance.word(),
})

export const validConfigWithAuthorization = () => ({
    ...validConfig(),
    authorization: validAuthorizationConfig.collectionPermissions 
})

export const validConfigWithAuthConfig = () => ({
    ...validConfig(),
    auth: {
        callbackUrl: chance.word(),
        clientId: chance.word(),
        clientSecret: chance.word(),
    }  
})

export const defineInvalidConfig = () => defineValidConfig({})

export const ExpectedProperties = ['PROJECT_ID', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'PERMISSIONS']

export const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

export const hasReadErrors = false
export const configReaderProvider = new GcpFirestoreConfigReader()
