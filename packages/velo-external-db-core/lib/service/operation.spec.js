const OperationService = require('./operation')
const { Uninitialized, gen } = require('test-commons')
const driver = require('../../test/drivers/operation-provider-test-support');
const { AccessDeniedError, WrongDatabaseError, HostDoesNotExists } = require('../../../velo-external-db-commons')

describe('Operation Service', () => {

    test('retrieve resolve when validate connection of valid pool', async () => {
        driver.givenValidPool();
        await expect(env.operationService.validateConnection()).resolves.toEqual({ valid: true });
    })

    test('retrieve throw with appropriate error when validate connection of invalid pool', async () => {
        driver.givenInvalidPool(ctx.error);
        await expect(env.operationService.validateConnection()).resolves.toEqual({ valid: false, error: ctx.error })
    })

    const ctx = {
        error: Uninitialized
    }

    const env = {
        operationService: Uninitialized,
        errorsList: [AccessDeniedError, WrongDatabaseError, HostDoesNotExists]
    };

    beforeEach(() => {
        driver.reset()

        ctx.error = gen.randomObjectFromArray(env.errorsList)

        env.operationService = new OperationService(driver.dataOperation)
    })
})