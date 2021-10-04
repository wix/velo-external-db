const { Uninitialized } = require('test-commons')
const { authMiddleware } = require('./auth-middleware');
const driver = require('../../test/drivers/auth_middleware_test_support');
const { UnauthorizedError } = require('velo-external-db-commons').errors
const Chance = require('chance')
const chance = Chance();

describe('Auth Middleware', () => {

    const ctx = {
        secretKey: Uninitialized,
        anotherSecretKey: Uninitialized,
        next: Uninitialized,
        adminRole: Uninitialized,
        ownerRole: Uninitialized,
        nonAdminRole: Uninitialized,
        nonOwnerRole: Uninitialized,
        dataPath: Uninitialized,
        schemaPath: Uninitialized,
    };

    const env = {
        auth: Uninitialized,
    };

    beforeEach(() => {
        ctx.secretKey = chance.word()
        ctx.anotherSecretKey = chance.word()
        ctx.adminRole = chance.pickone(['OWNER', 'BACKEND_CODE'])
        ctx.ownerRole = chance.pickone(['OWNER'])
        ctx.nonAdminRole = chance.pickone(['VISITOR', 'MEMBER'])
        ctx.nonOwnerRole = chance.pickone(['BACKEND_CODE', 'VISITOR', 'MEMBER'])
        ctx.dataPath = `/data/${chance.word().toLowerCase()}`
        ctx.schemaPath = `/schemas/${chance.word().toLowerCase()}`
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
        expect( () => env.auth({body: { requestContext: { settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { role: '', settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { role: [], settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
        expect( () => env.auth({body: { requestContext: { role: {}, settings: 'x' } } }, Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should throw when secret key does not match', () => {
        expect( () => env.auth(driver.requestBodyWith(ctx.anotherSecretKey, ctx.ownerRole, ctx.dataPath), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    })

    test('should call next when secret key matches', () => {
        env.auth(driver.requestBodyWith(ctx.secretKey, ctx.ownerRole, ctx.dataPath), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalled()
    })

    test('should enforce role [OWNER, BACKEND_CODE] on data api', () => {
        env.auth(driver.requestBodyWith(ctx.secretKey, ctx.adminRole, ctx.dataPath), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalled()
    })

    // test('data api with Visitor role will throw', () => {
    //     expect( () => env.auth(driver.requestBodyWith(ctx.secretKey, ctx.nonAdminRole, ctx.dataPath), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    // })

    test('should enforce role [OWNER] on schema api', () => {
        env.auth(driver.requestBodyWith(ctx.secretKey, ctx.ownerRole, ctx.schemaPath), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalled()
    })

    // test('schema api with non owner role will throw', () => {
    //     expect( () => env.auth(driver.requestBodyWith(ctx.secretKey, ctx.nonOwnerRole, ctx.schemaPath), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    // })

    test('should enforce role [OWNER] on provision api', () => {
        env.auth(driver.requestBodyWith(ctx.secretKey, ctx.ownerRole, '/provision'), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalled()
    })

    // test('provision api with non owner role will throw', () => {
    //     expect( () => env.auth(driver.requestBodyWith(ctx.secretKey, ctx.nonOwnerRole, '/provision'), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    // })

    // test('should not allow unauthorized paths other then what we tested before', () => {
    //     expect( () => env.auth(driver.requestBodyWith(ctx.secretKey, ctx.ownerRole, '/xxx'), Uninitialized, ctx.next) ).toThrow(UnauthorizedError)
    // })
})
