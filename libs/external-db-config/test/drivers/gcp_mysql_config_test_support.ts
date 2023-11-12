import { GcpConfigReader } from '../../src/readers/gcp_config_reader'
import Chance = require('chance')
const chance = new Chance()
import { validAuthorizationConfig } from '../test_utils'
import { MySqlConfig } from '../test_types'

export const defineValidConfig = (config: MySqlConfig) => {
    if (config.cloudSqlConnectionName) {
        process.env['CLOUD_SQL_CONNECTION_NAME'] = config.cloudSqlConnectionName
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
    if (config.allowedMetasites) {
        process.env['ALLOWED_METASITES'] = config.allowedMetasites
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
    cloudSqlConnectionName: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
    allowedMetasites: chance.word(),
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

export const ExpectedProperties = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'ALLOWED_METASITES', 'PERMISSIONS', 'JWT_PUBLIC_KEY', 'APP_DEF_ID']

export const defineInvalidConfig = () => defineValidConfig({})

export const reset = () => {
    ExpectedProperties.forEach(p => delete process.env[p])
}

export const configReaderProvider = new GcpConfigReader()
export const hasReadErrors = false

