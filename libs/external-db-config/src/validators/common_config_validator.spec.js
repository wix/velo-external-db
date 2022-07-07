const { Uninitialized } = require('@wix-velo/test-commons')
const { CommonConfigValidator } = require('./common_config_validator')
const each = require('jest-each').default
const gen = require('../../test/gen')
const { extendedCommonConfigRequiredProperties } = require('../../test/test_utils')

describe('MySqlConfigValidator', () => {

    test('not extended common config validator expect only secret key', () => {
        env.CommonConfigValidator = new CommonConfigValidator(ctx.validConfig)
        expect(env.CommonConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [] })
    })

    test('not extended common config validator will return if secretKey is missing', () => {
        env.CommonConfigValidator = new CommonConfigValidator({})
        expect(env.CommonConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: ['secretKey'] })
    })

    each(
        extendedCommonConfigRequiredProperties
    ).test('validate extended will detect missing property [%s]', async(s) => {
        delete ctx.validExtendedConfig[s]
        env.CommonConfigValidator = new CommonConfigValidator(ctx.validExtendedConfig, true)

        expect(env.CommonConfigValidator.validate()).toMatchObject({ missingRequiredSecretsKeys: [s] })
    })

    test('extended common config validator expect secret key cloud vendor, dbType', () => {
        env.CommonConfigValidator = new CommonConfigValidator(ctx.validExtendedConfig, true)
        expect(env.CommonConfigValidator.validate()).toMatchObject({ missingRequiredSecretsKeys: [], validType: true, validVendor: true })
    })

    const ctx = {
        validConfig: Uninitialized,
        validExtendedConfig: Uninitialized,
    }

    const env = {
        CommonConfigValidator: Uninitialized,
    }

    beforeEach(() => {
        ctx.validConfig = gen.randomCommonConfig()
        ctx.validExtendedConfig = gen.randomExtendedCommonConfig()
    })
})