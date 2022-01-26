const ConfigReader = require('./config_reader')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/external_db_config_test_support')
const { readConfigResponse, configStatusResponse, invalidConfigStatusResponse, invalidVendorConfigStatusResponse, invalidDbTypeConfigStatusResponse } = require('./config_reader_matchers')
const Chance = require('chance')
const chance = new Chance()

describe('Config Reader Client', () => {

    test('read config will retrieve config from secret provider and validate retrieved data', async() => {
        driver.givenConfig(ctx.config)
        driver.givenAuthConfig(ctx.config)

        await expect( env.configReader.readConfig() ).resolves.toEqual( readConfigResponse(ctx.config, ctx.config) )
    })

    test('status call will return successful message in case config is valid', async() => {
        driver.givenValidConfig()
        driver.givenValidAuthConfig()
        driver.givenValidCommonConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( configStatusResponse() )
    })

    test('status call will return error message containing list of missing properties', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenValidAuthConfig()
        driver.givenValidCommonConfig()

        await expect( env.configReader.configStatus() ).resolves.toEqual( invalidConfigStatusResponse(ctx.missingProperties) )
    })

    test('status call will return error message containing list of missing properties from common reader', async() => {
        driver.givenValidConfig()
        driver.givenValidAuthConfig()
        driver.givenInvalidCommonConfigWith(ctx.missingProperties)

        await expect( env.configReader.configStatus() ).resolves.toEqual( invalidConfigStatusResponse(ctx.missingProperties) )
    })

    test('status call will return error message containing list of all missing properties from common reader and normal reader', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenInvalidCommonConfigWith(ctx.moreMissingProperties)

        await expect( env.configReader.configStatus() ).resolves.toEqual( invalidConfigStatusResponse([...ctx.missingProperties, ...ctx.moreMissingProperties]))
    })

    test('status call with wrong cloud vendor', async() => {
        driver.givenValidConfig()
        driver.givenValidAuthConfig()
        driver.givenInvalidCloudVendor()

        await expect( env.configReader.configStatus() ).resolves.toEqual( invalidVendorConfigStatusResponse() )

    })

    test('status call with wrong db type', async() => {
        driver.givenValidConfig()
        driver.givenInvalidDBType()

        await expect( env.configReader.configStatus() ).resolves.toEqual( invalidDbTypeConfigStatusResponse() )
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
        ctx.configStatus = gen.randomConfig()
        ctx.missingProperties = Array.from({ length: 5 }, () => chance.word())
        ctx.moreMissingProperties = Array.from({ length: 5 }, () => chance.word())

        env.configReader = new ConfigReader(driver.configReader, driver.commonConfigReader, driver.authConfigReader)
    })
})
