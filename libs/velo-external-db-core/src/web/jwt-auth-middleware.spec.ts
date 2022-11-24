import { Uninitialized } from '@wix-velo/test-commons'
import * as driver from '../../test/drivers/auth_middleware_test_support'
import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import * as Chance from 'chance'
import { JwtAuthenticator, TOKEN_ISSUER } from './jwt-auth-middleware'
import { WixDataFacadeMock } from '../../test/drivers/auth_middleware_test_support'
import * as jwt from 'jsonwebtoken'
import { decodeBase64 } from '../utils/base64_utils'
import { authConfig } from '@wix-velo/test-commons'

const chance = Chance()

describe('JWT Auth Middleware', () => {

    const ctx = {
        externalDatabaseId: Uninitialized,
        metasite: Uninitialized,
        allowedMetasites: Uninitialized,
        next: Uninitialized,
        ownerRole: Uninitialized,
        dataPath: Uninitialized,
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

    test('should authorize when JWT valid', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: ctx.metasite }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith()
    })

    test('should authorize when JWT valid, only with second public key', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: ctx.metasite }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256' })
        env.auth = new JwtAuthenticator(ctx.externalDatabaseId, ctx.allowedMetasites, new WixDataFacadeMock(decodeBase64(authConfig.otherAuthPublicKey), decodeBase64(authConfig.authPublicKey))).authorizeJwt()
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith()
    })

    test('should throw when JWT metasite is not allowed', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: chance.word() }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT has no metasite claim', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT issuer is not Wix-Data', async() => {
        const token = jwt.sign({ iss: chance.word(), metasite: ctx.metasite }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT has no issuer', async() => {
        const token = jwt.sign({ metasite: ctx.metasite }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256' })
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })

    test('should throw when JWT is expired', async() => {
        const token = jwt.sign({ iss: TOKEN_ISSUER, metasite: ctx.metasite }, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256', expiresIn: '10ms' })
        setTimeout(() => {}, 1000)
        await env.auth(driver.requestBodyWith(ctx.ownerRole, ctx.dataPath, `Bearer ${token}`), Uninitialized, ctx.next)

        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError('You are not authorized'))
    })
})
