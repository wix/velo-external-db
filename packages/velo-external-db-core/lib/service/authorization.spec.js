const AuthorizationService = require('./authorization')
const { Uninitialized, gen } = require('test-commons')
const { UnauthorizedError, InvalidQuery } = require('velo-external-db-commons/lib/errors')

describe('Authorization Service', () => {
    describe('Authorize read', () => {
        test('authorizeRead on collection with permitted role should not throw', () => {
            expect(() => env.authorizationService.authorizeRead(ctx.collectionName, ctx.authorizedReadRole)).not.toThrow()
        })
    
        test('authorizeRead on collection with not permitted role should throw UnauthorizedError', () => {
            expect(() => env.authorizationService.authorizeRead(ctx.collectionName, ctx.unauthorizedReadRole)).toThrow(UnauthorizedError)
        })
    
        test('authorizeRead on nonexistent collection should throw InvalidQuery', () => {
            expect(() => env.authorizationService.authorizeRead('wrong', ctx.authorizedReadRole)).toThrow(InvalidQuery)
        })
    })  
    
    describe('Authorize write', () => {
        test('authorizeWrite on collection with permitted role should not throw', () => {
            expect(() => env.authorizationService.authorizeWrite(ctx.collectionName, ctx.authorizedWriteRole)).not.toThrow()
        })
    
        test('authorizeWrite on collection with not permitted role should throw UnauthorizedError', () => {
            expect(() => env.authorizationService.authorizeWrite(ctx.collectionName, ctx.unauthorizedWriteRole)).toThrow(UnauthorizedError)
        })
    
        test('authorizeWrite on nonexistent collection should throw InvalidQuery', () => {
            expect(() => env.authorizationService.authorizeWrite('wrong', ctx.authorizedWriteRole)).toThrow(InvalidQuery)
        })
    })  



    const env = {
        config: Uninitialized,
        authorizationService: Uninitialized
    }
    
    beforeAll(() => {
        env.config = gen.authorizationConfig()
        env.authorizationService = new AuthorizationService(env.config)
    })
    
    const ctx = {
        collectionName: Uninitialized,
        authorizedReadRole: Uninitialized,
        unauthorizedReadRole: Uninitialized,
        authorizedWriteRole: Uninitialized,
        unauthorizedWriteRole: Uninitialized,
    }

    beforeEach(() => {
        ctx.collectionName = gen.collectionNameFrom(env.config)
        ctx.authorizedReadRole = gen.authorizedReadRoleFor(ctx.collectionName, env.config)
        ctx.unauthorizedReadRole = gen.unauthorizedReadRoleFor(ctx.collectionName, env.config)
        ctx.authorizedWriteRole = gen.authorizedWriteRoleFor(ctx.collectionName, env.config)
        ctx.unauthorizedWriteRole = gen.unauthorizedWriteRoleFor(ctx.collectionName, env.config)
    })

})

