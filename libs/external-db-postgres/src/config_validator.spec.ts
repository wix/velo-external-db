import each from 'jest-each'
import { Uninitialized } from '@wix-velo/test-commons'
import { PostgresConfigValidator } from './postgres_config_validator'
import * as gen from '../tests/gen'

describe('PostgresConfigValidator', () => {

    test('PostgresConfigValidator will validate valid config', () => {
        env.postgresConfigValidator = new PostgresConfigValidator(ctx.validConfig)
        expect(env.postgresConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [] })
    })

    test('PostgresConfigValidator will validate valid GCP config', () => {
        env.postgresConfigValidator = new PostgresConfigValidator(ctx.validGCPConfig)
        expect(env.postgresConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [] })
    })

    test('PostgresConfigValidator will detect config with invalid HOST property', () => {
        env.postgresConfigValidator = new PostgresConfigValidator(ctx.configWithInvalidHost)
        expect(env.postgresConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [ 'host/cloudSqlConnectionName' ] })
    })

    each([ 'user', 'password', 'db', ]).test('PostgresConfigValidator will detect missing property [%s]', (s) => {
        delete ctx.validConfig[s]
        env.postgresConfigValidator = new PostgresConfigValidator(ctx.validConfig)
        expect(env.postgresConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [s] })
    })

    test('PostgresConfigValidator will detect missing property [host]', () => {
        delete ctx.validConfig.host
        env.postgresConfigValidator = new PostgresConfigValidator(ctx.validConfig)
        expect(env.postgresConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: ['host/cloudSqlConnectionName'] })
    })

    test('PostgresConfigValidator will detect missing property [cloudSqlConnectionName]', () => {
        delete ctx.validGCPConfig.cloudSqlConnectionName
        env.postgresConfigValidator = new PostgresConfigValidator(ctx.validGCPConfig)
        expect(env.postgresConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: ['host/cloudSqlConnectionName'] })
    })

    const ctx = {
        validGCPConfig: Uninitialized,
        validConfig: Uninitialized,
        configWithInvalidHost: Uninitialized,
    }

    const env = {
        postgresConfigValidator: Uninitialized,
    }

    beforeEach(() => {
        ctx.validConfig = gen.validConfig()
        ctx.validGCPConfig = gen.validGCPConfig()
        ctx.configWithInvalidHost = gen.configWithInvalidHost()
    })
})
