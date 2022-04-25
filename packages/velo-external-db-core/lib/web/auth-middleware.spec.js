const { Uninitialized } = require('test-commons')
const { secretKeyAuthMiddleware } = require('./auth-middleware')
const driver = require('../../../velo-external-db/test/drivers/auth_middleware_test_support') //TODO: change driver location
const { UnauthorizedError } = require('velo-external-db-commons').errors
const Chance = require('chance')
const chance = Chance()

describe('Auth Middleware', () => {

    const ctx = {
        secretKey: Uninitialized,
        anotherSecretKey: Uninitialized,
        next: Uninitialized,
    }

    const env = {
        auth: Uninitialized,
    }

    beforeEach(() => {
        ctx.secretKey = chance.word()
        ctx.anotherSecretKey = chance.word()
        ctx.next = jest.fn().mockName('next')

        env.auth = secretKeyAuthMiddleware({ secretKey: ctx.secretKey })
    })

    test('should throw when request does not contain auth', () => {
        expect( () => env.auth({ body: { } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: {} } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: '' } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { settings: {} } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { settings: '' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: [] } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { role: '', settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { role: [], settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { role: {}, settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should throw when secret key does not match', () => {
        expect( () => env.auth(driver.requestBodyWith(ctx.anotherSecretKey, ctx.ownerRole, ctx.dataPath), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should call next when secret key matches', () => {
        env.auth(driver.requestBodyWith(ctx.secretKey, ctx.ownerRole, ctx.dataPath), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalled()
    })
})
