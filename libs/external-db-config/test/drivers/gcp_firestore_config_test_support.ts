import { GcpFirestoreConfigReader } from '../../src/readers/gcp_config_reader'
import * as Chance from 'chance'
import { validAuthorizationConfig } from '../test_utils'
import { FiresStoreConfig } from '../test_types'
const chance = new Chance()

export const defineValidConfig = (config: FiresStoreConfig) => {
    if (config.projectId) {
        process.env['PROJECT_ID'] = config.projectId
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

export const validConfig = (): FiresStoreConfig => ({
    projectId: chance.word(),
    jwtPublicKey: chance.word(),
    appDefId: chance.word(),
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

export const ExpectedProperties = ['PROJECT_ID', 'PERMISSIONS', 'JWT_PUBLIC_KEY', 'APP_DEF_ID']

export const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

export const hasReadErrors = false
export const configReaderProvider = new GcpFirestoreConfigReader()
