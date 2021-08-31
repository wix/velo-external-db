const { Uninitialized, gen } = require('test-commons')
const { getConfig,maskSensitiveData } = require ('./app_info')
const driver = require('./app_info_test_support')

describe('App info Function', () => {
    test('get app info will retrieve valid config and will create app info object', async () => {
        driver.givenConfig(ctx.config)
        driver.givenDBConnectionStatus(driver.validDBConnectionStatus)

        const appInfo = await getConfig(driver.operationService, driver.configReaderClient)
        
        expect( appInfo ).toEqual({
            CONFIG_STATUS : driver.validConfigReaderStatus,
            CONFIG: maskSensitiveData(ctx.config),
            CONNECTION_STATUS: driver.validDBConnectionStatus,
        })
    })

    const ctx = {
        config: Uninitialized,
    };

    beforeEach(() => {
        driver.reset()
        ctx.config = gen.randomConfig()
    });


})