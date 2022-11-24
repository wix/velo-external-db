import {sleep, Uninitialized} from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/auth_middleware_test_support'
import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import * as Chance from 'chance'
import { JwtAuthenticator, TOKEN_ISSUER } from './jwt-auth-middleware'
import {
    signedToken,
    WixDataFacadeMock
} from '../../test/drivers/auth_middleware_test_support'
import { decodeBase64 } from '../utils/base64_utils'
import { authConfig } from '@wix-velo/test-commons'

const chance = Chance()

describe('JWT Auth Middleware', () => {

    test('should authorize when JWT valid', async() => {
        const token = signedToken({iss: TOKEN_ISSUER, metasite: ctx.metasite})
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith()
    })

    test('should authorize when JWT valid, only with second public key', async() => {
        const token = signedToken({iss: TOKEN_ISSUER, metasite: ctx.metasite})
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, new WixDataFacadeMock(decodeBase64(authConfig.otherAuthPublicKey), decodeBase64(authConfig.authPublicKey))).authorizeJwt()
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith()
    })

    test('should throw when JWT metasite is not allowed', async() => {
        const token = signedToken({iss: TOKEN_ISSUER, metasite: chance.word()})
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT has no metasite claim', async() => {
        const token = signedToken({iss: TOKEN_ISSUER})
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT issuer is not Wix-Data', async() => {
        const token = signedToken({iss: chance.word(), metasite: ctx.metasite})
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT has no issuer', async() => {
        const token = signedToken({metasite: ctx.metasite})
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT is expired', async() => {
        const token = signedToken({iss: TOKEN_ISSUER, metasite: ctx.metasite}, '10ms')
        await sleep(1000)
        await env.auth(driver.requestBodyWith(Uninitialized, Uninitialized, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    const ctx = {
        externalDatabaseId: Uninitialized,
        metasite: Uninitialized,
        allowedMetasites: Uninitialized,
        next: Uninitialized,
    }

    const env = {
        auth: Uninitialized,
    }

    beforeEach(() => {
        ctx.externalDatabaseId = chance.word()
        ctx.metasite = chance.word()
        ctx.allowedMetasites = ctx.metasite
        ctx.next = jest.fn().mockName('next')
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, new WixDataFacadeMock(decodeBase64(authConfig.authPublicKey))).authorizeJwt()
    })
})
