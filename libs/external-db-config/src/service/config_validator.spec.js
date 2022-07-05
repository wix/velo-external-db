const { Uninitialized } = require('@wix-velo/test-commons')
const driver = require('../../test/drivers/external_db_config_test_support')
const matchers = require('./config_validator_matchers')
const gen = require('../../test/gen')
const Chance = require('chance')
const { ConfigValidator } = require('../validators/config_validator')
const chance = new Chance()

describe('Config Reader Client', () => {

    test('read config will retrieve config from secret provider and validate retrieved data', async() => {
        driver.givenConfig(ctx.config)
        driver.givenCommonConfig(ctx.secretKey)
        driver.givenAuthorizationConfig(ctx.authorizationConfig)

        expect( env.configReader.readConfig() ).toEqual(matchers.configResponseFor(ctx.config, ctx.authorizationConfig))
    })

    test('status call will return successful message in case config is valid', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenValidAuthorizationConfig()

        expect( env.configReader.configStatus() ).toEqual( matchers.validConfigStatusResponse() )
    })

    test('status call will return error message containing list of missing properties', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenValidCommonConfig()
        driver.givenValidAuthorizationConfig()

        expect( env.configReader.configStatus() ).toEqual( matchers.configResponseWithMissingProperties(ctx.missingProperties) )
    })

    test('status call will return error message containing list of missing properties from common reader', async() => {
        driver.givenValidConfig()
        driver.givenInvalidCommonConfigWith(ctx.missingProperties)
        driver.givenValidAuthorizationConfig()

        expect( env.configReader.configStatus() ).toEqual( matchers.configResponseWithMissingProperties(ctx.missingProperties) )
    })

    test('status call will return error message containing list of all missing properties from common reader and normal reader', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenInvalidCommonConfigWith(ctx.moreMissingProperties)
        driver.givenValidAuthorizationConfig()

        expect( env.configReader.configStatus() ).toEqual( matchers.configResponseWithMissingProperties([...ctx.missingProperties, ...ctx.moreMissingProperties]))
    })

    // test('status call with wrong cloud vendor', async() => {
    //     driver.givenValidConfig()
    //     driver.givenInvalidCloudVendor()
    //     driver.givenValidAuthorizationConfig()

    //     expect( env.configReader.configStatus() ).toEqual( matchers.invalidVendorConfigStatusResponse() )
    // })

    // test('status call with wrong db type', async() => {
    //     driver.givenValidConfig()
    //     driver.givenInvalidDBType()
    //     driver.givenValidAuthorizationConfig()

    //     await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.invalidDbTypeConfigStatusResponse() )
    // })

    test('status call with empty authorization config', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenEmptyAuthorizationConfig()

        expect( env.configReader.configStatus() ).toEqual( matchers.emptyAuthorizationConfigStatusResponse() )
    })

    test('status call with wrong authorization config format', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenInvalidAuthorizationConfig()

        expect( env.configReader.configStatus() ).toEqual( matchers.invalidAuthorizationConfigStatusResponse() )
    })

    const ctx = {
        config: Uninitialized,
        configStatus: Uninitialized,
        missingProperties: Uninitialized,
        moreMissingProperties: Uninitialized,
        secretKey: Uninitialized,
    }

    const env = {
        configReader: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        ctx.config = gen.randomConfig()
        ctx.authorizationConfig = gen.randomConfig()
        ctx.configStatus = gen.randomConfig()
        ctx.missingProperties = Array.from({ length: 5 }, () => chance.word())
        ctx.moreMissingProperties = Array.from({ length: 5 }, () => chance.word())
        ctx.secretKey = chance.guid()
        env.configReader = new ConfigValidator(driver.configValidator, driver.authorizationConfigValidator, driver.commonConfigValidator)
    })
})
