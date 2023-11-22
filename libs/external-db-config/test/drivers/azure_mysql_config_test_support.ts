import { AzureConfigReader } from '../../src/readers/azure_config_reader'
import Chance = require('chance')
const chance = new Chance()
import { validAuthorizationConfig } from '../test_utils'
import { MySqlConfig } from '../test_types'

export const defineValidConfig = (config: MySqlConfig) => {
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

export const validConfig = (): MySqlConfig => ({
    host: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    jwtPublicKey: chance.word(),
    appDefId: chance.word(),
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
        clientSecret: chance.word()
    }  
})

export const defineInvalidConfig = () => defineValidConfig({})

export const ExpectedProperties = ['HOST', 'USER', 'PASSWORD', 'DB', 'PERMISSIONS', 'JWT_PUBLIC_KEY', 'APP_DEF_ID']

export const reset = () => ExpectedProperties.forEach(p => delete process.env[p])

export const hasReadErrors = false
export const configReaderProvider = new AzureConfigReader()

