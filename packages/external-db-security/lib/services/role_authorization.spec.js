const RoleAuthorizationService = require('./role_authorization')
const { Uninitialized } = require('@wix-velo/test-commons')
const gen = require ('../test/gen') 
const { UnauthorizedError } = require('@wix-velo/velo-external-db-commons/lib/errors')
const each = require('jest-each').default

describe('Authorization Service', () => {
    describe('Authorize read', () => {
        test('authorizeRead on collection with permitted role should not throw', () => {
            expect(() => env.roleAuthorizationService.authorizeRead(ctx.collectionName, ctx.authorizedReadRole)).not.toThrow()
        })
    
        test('authorizeRead on collection with not permitted role should throw UnauthorizedError', () => {
            expect(() => env.roleAuthorizationService.authorizeRead(ctx.collectionName, ctx.unauthorizedReadRole)).toThrow(UnauthorizedError)
        })
    
        each([
            'OWNER', 'BACKEND_CODE'
        ]).test('authorizeRead on nonexistent collection in config should allow default policies', (role) => {
            expect(() => env.roleAuthorizationService.authorizeRead('wrong', role)).not.toThrow()
        })

        each([
            'MEMBER', 'VISITOR'
        ]).test('authorizeRead on nonexistent collection in config should throw UnauthorizedError on any other role but default', (role) => {
            expect(() => env.roleAuthorizationService.authorizeRead('wrong', role)).toThrow(UnauthorizedError)
        })

    })  
    
    describe('Authorize write', () => {
        test('authorizeWrite on collection with permitted role should not throw', () => {
            expect(() => env.roleAuthorizationService.authorizeWrite(ctx.collectionName, ctx.authorizedWriteRole)).not.toThrow()
        })
    
        test('authorizeWrite on collection with not permitted role should throw UnauthorizedError', () => {
            expect(() => env.roleAuthorizationService.authorizeWrite(ctx.collectionName, ctx.unauthorizedWriteRole)).toThrow(UnauthorizedError)
        })
    
        each([
            'OWNER', 'BACKEND_CODE'
        ]).test('authorizeWrite on nonexistent collection in config should allow default policies', (role) => {
            expect(() => env.roleAuthorizationService.authorizeWrite('wrong', role)).not.toThrow()
        })
        
        each([
            'MEMBER', 'VISITOR'
        ]).test('authorizeWrite on nonexistent collection in config should throw UnauthorizedError on any other role but default', (role) => {
            expect(() => env.roleAuthorizationService.authorizeWrite('wrong', role)).toThrow(UnauthorizedError)
        })
    })  



    const env = {
        config: Uninitialized,
        roleAuthorizationService: Uninitialized
    }
    
    beforeAll(() => {
        env.config = gen.authorizationConfig()
        env.roleAuthorizationService = new RoleAuthorizationService(env.config)
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

