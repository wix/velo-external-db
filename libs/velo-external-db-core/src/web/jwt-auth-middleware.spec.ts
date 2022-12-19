import { sleep, Uninitialized } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/auth_middleware_test_support'
import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import * as Chance from 'chance'
import { JwtAuthenticator, TOKEN_ISSUER } from './jwt-auth-middleware'
import {
    signedToken,
    WixDataFacadeMock
} from '../../test/drivers/auth_middleware_test_support'
import { authConfig } from '@wix-velo/test-commons'
import { PublicKeyMap } from './wix_data_facade'

const chance = Chance()

describe('JWT Auth Middleware', () => {

    test('should authorize when JWT valid', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite, aud: ctx.externalDatabaseId }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectAuthorized()
    })

    test('should authorize when JWT valid, only with second public key', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite, aud: ctx.externalDatabaseId }, ctx.keyId)
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, ctx.otherWixDataMock).authorizeJwt()
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)
        expectAuthorized()
    })

    test('should throw when JWT siteId is not allowed', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: chance.word(), aud: ctx.externalDatabaseId }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT has no siteId claim', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, aud: ctx.externalDatabaseId }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT issuer is not Wix-Data', async() => {
        const token = signedToken({ iss: chance.word(), siteId: ctx.metasite, aud: ctx.externalDatabaseId }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT has no issuer', async() => {
        const token = signedToken({ siteId: ctx.metasite, aud: ctx.externalDatabaseId }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT audience is not externalDatabaseId of adapter', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite, aud: chance.word() }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT has no audience', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite }, ctx.keyId)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT kid is not found in Wix-Data keys', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite, aud: ctx.externalDatabaseId }, chance.word())
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT kid is absent', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite, aud: ctx.externalDatabaseId })
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    test('should throw when JWT is expired', async() => {
        const token = signedToken({ iss: TOKEN_ISSUER, siteId: ctx.metasite, aud: ctx.externalDatabaseId }, ctx.keyId, '10ms')
        await sleep(1000)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), null, ctx.next)

        expectUnauthorized()
    })

    const ctx = {
        externalDatabaseId: Uninitialized,
        metasite: Uninitialized,
        allowedMetasites: Uninitialized,
        next: Uninitialized,
        keyId: Uninitialized,
        otherWixDataMock: Uninitialized
    }

    const env = {
        auth: Uninitialized,
    }

    const expectUnauthorized = () => {
        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    }

    const expectAuthorized = () => {
        expect(ctx.next).not.toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
        expect(ctx.next).toHaveBeenCalledWith()
    }

    beforeEach(() => {
        ctx.externalDatabaseId = chance.word()
        ctx.metasite = chance.word()
        ctx.allowedMetasites = ctx.metasite
        ctx.keyId = chance.word()
        const otherKeyId = chance.word()
        ctx.next = jest.fn().mockName('next')
        const publicKeys: PublicKeyMap = {}
        publicKeys[ctx.keyId] = authConfig.authPublicKey
        const otherPublicKeys: PublicKeyMap = {}
        otherPublicKeys[otherKeyId] = authConfig.otherAuthPublicKey
        ctx.otherWixDataMock = new WixDataFacadeMock(otherPublicKeys, publicKeys)
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, new WixDataFacadeMock(publicKeys)).authorizeJwt()
    })
})
