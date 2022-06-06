const { Uninitialized } = require('@wix-velo/test-commons')
const { authRoleMiddleware } = require('./auth-role-middleware')
const driver = require('../../test/drivers/auth_middleware_test_support')
const { UnauthorizedError } = require('@wix-velo/velo-external-db-commons').errors
const Chance = require('chance')
const chance = Chance()

describe('Auth Role Middleware', () => {

    const ctx = {
        permittedRoles: Uninitialized,
        permittedRole: Uninitialized,
        notPermittedRole: Uninitialized,
        next: Uninitialized,
    }

    const env = {
        auth: Uninitialized,
    }

    beforeEach(() => {
        ctx.permittedRoles = Array.from({ length: 5 }, () => chance.word())
        ctx.permittedRole = chance.pickone(ctx.permittedRoles)
        ctx.notPermittedRole = chance.word()
        ctx.next = jest.fn().mockName('next')

        env.auth = authRoleMiddleware({ roles: ctx.permittedRoles })
    })

    test('should throw when request does not contain role', () => {
        expect( () => env.auth({ body: { } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: {} } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: '' } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: [] } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { role: '' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { role: [] } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({ body: { requestContext: { role: {} } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should allow request with permitted role on request', () => {
        env.auth(driver.requestBodyWith(ctx.secretKey, ctx.permittedRole), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalled()
    })

    test('should not allow request with permitted role on request', () => {
        expect( () => env.auth(driver.requestBodyWith(ctx.secretKey, ctx.notPermittedRole), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })
})
