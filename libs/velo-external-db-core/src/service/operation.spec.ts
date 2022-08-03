import OperationService from './operation'
import { Uninitialized, gen } from '@wix-velo/test-commons'
import driver = require('../../test/drivers/operation_provider_test_support')
import { errors } from '@wix-velo/velo-external-db-commons'
const { DbConnectionError } = errors

describe('Operation Service', () => {

    test('retrieve resolve when validate connection of valid pool', async() => {
        driver.givenValidPool()
        await expect(env.operationService.validateConnection()).resolves.toEqual({ valid: true })
    })

    test('retrieve throw with appropriate error when validate connection of invalid pool', async() => {
        driver.givenInvalidPool(ctx.error)
        await expect(env.operationService.validateConnection()).resolves.toEqual({ valid: false, error: ctx.error })
    })

    const ctx = {
        error: Uninitialized
    }

    interface Enviorment {
        operationService: OperationService
    }

    const env: Enviorment = {
        operationService: Uninitialized,
    }

    beforeEach(() => {
        driver.reset()

        ctx.error = gen.randomObjectFromArray([DbConnectionError])

        env.operationService = new OperationService(driver.dataOperation)
    })
})
