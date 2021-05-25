const { Uninitialized } = require('../../test/commons/test-commons');
const { authMiddleware } = require('./auth-middleware');
const { UnauthorizedError } = require('../error/errors')
const Chance = require('chance')
const chance = Chance();
const sinon = require('sinon')

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
        ctx.next = sinon.mock()

        env.auth = authMiddleware({ secretKey: ctx.secretKey })
    });

    it('should throw when request does not contain auth', () => {
        expect( () => env.auth({body: { } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: {} } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: '' } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { settings: {} } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { settings: '' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: [] } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    it('should throw when secret key does not match', () => {
        expect( () => env.auth(requestBodyWith(ctx.anotherSecretKey), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    it('should call next when secret key matches', () => {
      env.auth(requestBodyWith(ctx.secretKey), Uninitialized, ctx.next)

      sinon.assert.calledOnce(ctx.next)
    })
})
