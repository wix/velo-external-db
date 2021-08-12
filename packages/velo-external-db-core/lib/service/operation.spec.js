const OperationService = require('./operation')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/operation-provider-test-support');
const { AccessDeniedError, wrongDatabaseError, HostDoesNotExists } = require('../../../velo-external-db-commons')

describe('Operation Service', () => {

    test('retrieve resolve when validate connection of valid pool', async () => {
        driver.givenValidPool();
        await expect(env.operationService.validateConnection()).resolves.not.toThrow();
    })

    test('retrieve throw with appropriate error when validate connection of invalid pool', async () => {
        driver.givenInvalidPool(ctx.error);
        await expect(env.operationService.validateConnection()).rejects.toThrow(ctx.error)
    })

    const ctx = {
        error: Uninitialized
    }

    const env = {
        operationService: Uninitialized,
        errorsList: [AccessDeniedError, wrongDatabaseError, HostDoesNotExists]
    };

    beforeEach(() => {
        driver.reset()

        ctx.error = gen.randomObjectFromArray(env.errorsList)

        env.operationService = new OperationService(driver.dataOperation)
    })
})