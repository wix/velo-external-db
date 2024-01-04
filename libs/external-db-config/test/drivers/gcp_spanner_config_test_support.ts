import { GcpSpannerConfigReader } from '../../src/readers/gcp_config_reader'
import * as Chance from 'chance'
const chance = new Chance()
import { validAuthorizationConfig } from '../test_utils'
import { SpannerConfig } from '../test_types'

export const defineValidConfig = (config: SpannerConfig) => {
    if (config.projectId) {
        process.env['PROJECT_ID'] = config.projectId
    }
    if (config.instanceId) {
        process.env['INSTANCE_ID'] = config.instanceId
    }
    if (config.databaseId) {
        process.env['DATABASE_ID'] = config.databaseId
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

export const validConfig = (): SpannerConfig => ({
    projectId: chance.word(),
    instanceId: chance.word(),
    databaseId: chance.word(),
    jwtPublicKey: chance.word(),
    appDefId: chance.word(),
})

export const validConfigWithAuthorization = (): SpannerConfig => ({
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

export const ExpectedProperties = ['PROJECT_ID', 'INSTANCE_ID', 'DATABASE_ID', 'PERMISSIONS', 'JWT_PUBLIC_KEY', 'APP_DEF_ID']

export const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

export const hasReadErrors = false
export const configReaderProvider = new GcpSpannerConfigReader()
