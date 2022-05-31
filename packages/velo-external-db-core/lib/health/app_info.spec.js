const { Uninitialized, gen: genCommon } = require('@wix-velo/test-commons')
const { appInfoFor, maskSensitiveData } = require ('./app_info')
const driver = require('../../test/drivers/app_info_test_support') //TODO: change driver location

describe('App info Function', () => {
    test('get app info will retrieve valid config and will create app info object', async() => {
        driver.defineValidConfigReaderClient(ctx.config)
        driver.defineValidOperationService()

        const appInfo = await appInfoFor(driver.operationService, driver.configReaderClient)
        
        expect(appInfo).toEqual({
            configReaderStatus: driver.validConfigReaderStatus,
            config: maskSensitiveData(ctx.config),
            dbConnectionStatus: driver.validDBConnectionStatus,
        })
    })

    test('get app info will retrieve broken config', async() => {
        driver.defineBrokenConfigReaderClient(ctx.config)
        driver.defineValidOperationService()

        const appInfo = await appInfoFor(driver.operationService, driver.configReaderClient)

        expect(appInfo.configReaderStatus).toContain(driver.missingRequiredConfigKeys)
    })

    test('get app info will retrieve valid config and will fail in db connection', async() => {
        driver.defineValidConfigReaderClient(ctx.config)
        driver.defineBrokenOperationService()

        const appInfo = await appInfoFor(driver.operationService, driver.configReaderClient)

        expect(appInfo.dbConnectionStatus).toContain(driver.wrongDBConnectionStatus)
    })

    const ctx = {
        config: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()
        ctx.config = genCommon.randomObject()
    })


})