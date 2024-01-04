import { Uninitialized } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/external_db_config_test_support'
import * as matchers from './config_validator_matchers'
import * as gen from '../../test/gen'
import Chance = require('chance')
import { ConfigValidator } from '../validators/config_validator'
const chance = new Chance()

describe('Config Reader Client', () => {

    test('read config will retrieve config from secret provider and validate retrieved data', async() => {
        driver.givenConfig(ctx.config)
        driver.givenAuthorizationConfig(ctx.authorizationConfig)

        expect( env.configValidator.readConfig() ).toEqual(matchers.configResponseFor(ctx.config, ctx.authorizationConfig))
    })

    test('status call will return successful message in case config is valid', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenValidAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.validConfigStatusResponse() )
    })

    test('status call will return error message containing list of missing properties', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenValidCommonConfig()
        driver.givenValidAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.configResponseWithMissingProperties(ctx.missingProperties) )
    })

    test('status call will return error message containing list of missing properties from common reader', async() => {
        driver.givenValidConfig()
        driver.givenInvalidCommonConfigWith(ctx.missingProperties)
        driver.givenValidAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.configResponseWithMissingProperties(ctx.missingProperties) )
    })

    test('status call will return error message containing list of all missing properties from common reader and normal reader', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenInvalidCommonConfigWith(ctx.moreMissingProperties)
        driver.givenValidAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.configResponseWithMissingProperties([...ctx.missingProperties, ...ctx.moreMissingProperties]))
    })

    test('status call with wrong cloud vendor', async() => {
        driver.givenValidConfig()
        driver.givenInvalidCloudVendor()
        driver.givenValidAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.invalidVendorConfigStatusResponse() )
    })

    test('status call with wrong db type', async() => {
        driver.givenValidConfig()
        driver.givenInvalidDBType()
        driver.givenValidAuthorizationConfig()

        await expect( env.configValidator.configStatus() ).toEqual( matchers.invalidDbTypeConfigStatusResponse() )
    })

    test('status call with empty authorization config', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenEmptyAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.emptyAuthorizationConfigStatusResponse() )
    })

    test('status call with wrong authorization config format', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenInvalidAuthorizationConfig()

        expect( env.configValidator.configStatus() ).toEqual( matchers.invalidAuthorizationConfigStatusResponse() )
    })

    const ctx = {
        config: Uninitialized,
        configStatus: Uninitialized,
        missingProperties: Uninitialized,
        moreMissingProperties: Uninitialized,
        externalDatabaseId: Uninitialized,
        authorizationConfig: Uninitialized,
    }

    const env:{
        configValidator: ConfigValidator
    } = {
        configValidator: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        ctx.config = gen.randomConfig()
        ctx.authorizationConfig = gen.randomConfig()
        ctx.configStatus = gen.randomConfig()
        ctx.missingProperties = Array.from({ length: 5 }, () => chance.word())
        ctx.moreMissingProperties = Array.from({ length: 5 }, () => chance.word())
        ctx.externalDatabaseId = chance.guid()
        env.configValidator = new ConfigValidator(driver.configValidator, driver.authorizationConfigValidator, driver.commonConfigValidator)
    })
})
