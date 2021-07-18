const { Uninitialized } = require('test-commons')
const { authMiddleware } = require('./auth-middleware');
const { UnauthorizedError } = require('velo-external-db-commons')
const Chance = require('chance')
const chance = Chance();

const requestBodyWith = secretKey => ({ body: {
        requestContext: {
            settings: {
                secretKey: secretKey
            } } } } )

describe('Auth Middleware', () => {

    const ctx = {
        secretKey: Uninitialized,
        anotherSecretKey: Uninitialized,
        next: Uninitialized,
    };

    const env = {
        auth: Uninitialized,
    };

    beforeEach(() => {
        ctx.secretKey = chance.word()
        ctx.anotherSecretKey = chance.word()
        ctx.next = jest.fn().mockName('next')

        env.auth = authMiddleware({ secretKey: ctx.secretKey })
    });

    test('should throw when request does not contain auth', () => {
        expect( () => env.auth({body: { } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: {} } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: '' } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { settings: {} } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { settings: '' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: [] } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should throw when secret key does not match', () => {
        expect( () => env.auth(requestBodyWith(ctx.anotherSecretKey), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should call next when secret key matches', () => {
      env.auth(requestBodyWith(ctx.secretKey), Uninitialized, ctx.next)

      expect(ctx.next).toHaveBeenCalled()

    })
})
