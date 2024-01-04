import { Uninitialized } from '@wix-velo/test-commons'
import { CommonConfigValidator } from './common_config_validator'
const each = require('jest-each').default
import gen = require('../../test/gen')
import { extendedCommonConfigRequiredProperties } from '../../test/test_utils'

describe('MySqlConfigValidator', () => {

    test('not extended common config validator expect only secret key', () => {
        env.CommonConfigValidator = new CommonConfigValidator(ctx.validConfig)
        expect(env.CommonConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: [] })
    })

    test('not extended common config validator will return if jwtPublicKey or appDefId are missing', () => {
        env.CommonConfigValidator = new CommonConfigValidator({})
        expect(env.CommonConfigValidator.validate()).toEqual({ missingRequiredSecretsKeys: ['jwtPublicKey', 'appDefId'] })
    })

    each(
        extendedCommonConfigRequiredProperties
    ).test('validate extended will detect missing property [%s]', async(s: string | number) => {
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

    const env: {
        CommonConfigValidator: CommonConfigValidator
    } = {
        CommonConfigValidator: Uninitialized,
    }

    beforeEach(() => {
        ctx.validConfig = gen.randomCommonConfig()
        ctx.validExtendedConfig = gen.randomExtendedCommonConfig()
    })
})
