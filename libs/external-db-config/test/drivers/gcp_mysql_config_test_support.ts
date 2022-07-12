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

export const validConfig = (): MySqlConfig => ({
    cloudSqlConnectionName: chance.word(),
    user: chance.word(),
    password: chance.word(),
    db: chance.word(),
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

export const ExpectedProperties = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY', 'callbackUrl', 'clientId', 'clientSecret', 'PERMISSIONS']

export const defineInvalidConfig = () => defineValidConfig({})

export const reset = () => {
    ExpectedProperties.forEach(p => delete process.env[p])
}

export const configReaderProvider = new GcpConfigReader()
export const hasReadErrors = false

