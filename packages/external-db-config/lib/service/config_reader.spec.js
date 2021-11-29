const ConfigReader = require('./config_reader')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/external_db_config_test_support')
const Chance = require('chance')
const chance = new Chance()

describe('Config Reader Client', () => {

    test('read config will retrieve config from secret provider and validate retrieved data', async() => {
        driver.givenConfig(ctx.config)

        const actual = await env.configReader.readConfig()

        expect( actual ).toEqual(ctx.config)
    })

    test('status call will return successful message in case config is valid', async() => {
        driver.givenValidConfig()
        driver.givenValidCommonConfig()

        const actual = await env.configReader.configStatus()

        expect( actual ).toEqual('External DB Config read successfully')
    })

    test('status call will return error message containing list of missing properties', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenValidCommonConfig()

        const actual = await env.configReader.configStatus()

        ctx.missingProperties
           .forEach(s => expect( actual ).toContain(s) )
    })

    test('status call will return error message containing list of missing properties from common reader', async() => {
        driver.givenValidConfig()
        driver.givenInvalidCommonConfigWith(ctx.missingProperties)

        const actual = await env.configReader.configStatus()

        ctx.missingProperties
           .forEach(s => expect( actual ).toContain(s) )
    })

    test('status call will return error message containing list of all missing properties from common reader and normal reader', async() => {
        driver.givenInvalidConfigWith(ctx.missingProperties)
        driver.givenInvalidCommonConfigWith(ctx.moreMissingProperties)

        const actual = await env.configReader.configStatus()

        ctx.missingProperties.concat(ctx.moreMissingProperties)
           .forEach(s => expect( actual ).toContain(s) )
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

        env.configReader = new ConfigReader(driver.configReader, driver.commonConfigReader)
    })
})
