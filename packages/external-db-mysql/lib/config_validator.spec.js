const each = require('jest-each').default
const { Uninitialized } = require('test-commons')
const { MySqlConfigValidator } = require('./config_validator')
const gen = require('../tests/gen')

describe('MySqlConfigValidator', () => {

    test('MySqlConfigValidator will validate valid config', () => {
        env.mySqlConfigValidator = new MySqlConfigValidator(ctx.validConfig)
        expect(env.mySqlConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [] })
    })

    test('MySqlConfigValidator will validate valid GCP config', () => {
        env.mySqlConfigValidator = new MySqlConfigValidator(ctx.validGCPConfig)
        expect(env.mySqlConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [] })
    })

    test('MySqlConfigValidator will detect config with invalid HOST property', () => {
        env.mySqlConfigValidator = new MySqlConfigValidator(ctx.configWithInvalidHost)
        expect(env.mySqlConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [ 'host/cloudSqlConnectionName' ] })
    })

    each([ 'user', 'password', 'db', ]).test('MySqlConfigValidator will detect missing property [%s]', (s) => {
        delete ctx.validConfig[s]
        env.mySqlConfigValidator = new MySqlConfigValidator(ctx.validConfig)
        expect(env.mySqlConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [s] })
    })

    test('MySqlConfigValidator will detect missing property [host]', () => {
        delete ctx.validConfig.host
        env.mySqlConfigValidator = new MySqlConfigValidator(ctx.validConfig)
        expect(env.mySqlConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: ['host/cloudSqlConnectionName'] })
    })

    test('MySqlConfigValidator will detect missing property [cloudSqlConnectionName]', () => {
        delete ctx.validGCPConfig.cloudSqlConnectionName
        env.mySqlConfigValidator = new MySqlConfigValidator(ctx.validGCPConfig)
        expect(env.mySqlConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: ['host/cloudSqlConnectionName'] })
    })

    const ctx = {
        validConfig: Uninitialized,
        validGCPConfig: Uninitialized,
        configWithInvalidHost: Uninitialized,
    }
    
    const env = {
        mySqlConfigValidator: Uninitialized,
    }

    beforeEach(() => {
        ctx.validConfig = gen.validConfig()
        ctx.validGCPConfig = gen.validGCPConfig()
        ctx.configWithInvalidHost = gen.configWithInvalidHost()
    })
})