const ConfigReader = require('./config_reader')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/external_db_config_test_support')
const matchers = require('./config_reader_matchers')
const Chance = require('chance')
const chance = new Chance()

describe('Config Reader Client', () => {

    test('read config will retrieve config from secret provider and validate retrieved data', async() => {
        driver.givenConfig(ctx.config)
        driver.givenAuthorizationConfig(ctx.authorizationConfig)

        await expect( env.configReader.readConfig() ).resolves.toEqual(matchers.configResponseFor(ctx.config, ctx.authorizationConfig))
    })

    test('status call will return successful message in case config is valid', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenValidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.validConfigStatusResponse() )
    })

    test('status call will return error message containing list of missing properties', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenValidCommonConfig()
        driver.givenValidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.configResponseWithMissingProperties(ctx.missingProperties) )
    })

    test('status call will return error message containing list of missing properties from common reader', async() => {
        driver.givenValidConfig()
        driver.givenInvalidCommonConfigWith(ctx.missingProperties)
        driver.givenValidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.configResponseWithMissingProperties(ctx.missingProperties) )
    })

    test('status call will return error message containing list of all missing properties from common reader and normal reader', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenInvalidCommonConfigWith(ctx.moreMissingProperties)
        driver.givenValidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.configResponseWithMissingProperties([...ctx.missingProperties, ...ctx.moreMissingProperties]))
    })

    test('status call with wrong cloud vendor', async() => {
        driver.givenValidConfig()
        driver.givenInvalidCloudVendor()
        driver.givenValidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.invalidVendorConfigStatusResponse() )

    })

    test('status call with wrong db type', async() => {
        driver.givenValidConfig()
        driver.givenInvalidDBType()
        driver.givenValidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.invalidDbTypeConfigStatusResponse() )
    })

    test('status call with empty authorization config', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenEmptyAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.emptyAuthorizationConfigStatusResponse() )
    })

    test('status call with wrong authorization config format', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()
        driver.givenInvalidAuthorizationConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( matchers.invalidAuthorizationConfigStatusResponse() )
    })

    const ctx = {
        config: Uninitialized,
        configStatus: Uninitialized,
        missingProperties: Uninitialized,
        moreMissingProperties: Uninitialized,
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

        env.configReader = new ConfigReader(driver.configReader, driver.commonConfigReader, driver.authorizationConfigReader)
    })
})
