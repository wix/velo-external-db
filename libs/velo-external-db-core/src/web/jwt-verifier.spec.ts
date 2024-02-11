import * as jwt from 'jsonwebtoken'
import * as Chance from 'chance'
import { Uninitialized, authConfig } from '@wix-velo/test-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import { JWTVerifier, TOKEN_ISSUER } from './jwt-verifier'

const { UnauthorizedError } = errors
const chance = Chance()

describe('JWT Verifier', () => {
    test('should authorize when JWT valid', async() => {
        const token = signedToken({ ...ctx.basicValidPayload, data: ctx.data })
        const decoded = env.jwtVerifier.verifyAndDecode(token)
        expect(decoded).toEqual({
            request: ctx.requestPayload,
            metadata: ctx.metadata,
        })
    })

    test('should throw when JWT is missing', async() => {
        expect(() => env.jwtVerifier.verifyAndDecode('')).toThrow(UnauthorizedError)
    })

    describe('should throw when JWT is invalid', () => {
        test('invalid issuer', async() => {
            const token = signedToken({ ...ctx.basicValidPayload, iss: 'hacker.com', data: ctx.data })
            expect(() => env.jwtVerifier.verifyAndDecode(token)).toThrow(UnauthorizedError)
        })
        
        test('invalid audience', async() => {
            const token = signedToken({ ...ctx.basicValidPayload, aud: 'wrong', data: ctx.data })
            expect(() => env.jwtVerifier.verifyAndDecode(token)).toThrow(UnauthorizedError)
        })

        test('expired signature', async() => {
            const token = signedToken({ ...ctx.basicValidPayload, data: ctx.data }, '0ms')
            expect(() => env.jwtVerifier.verifyAndDecode(token)).toThrow(UnauthorizedError)
        })

        test('wrong privateKey', async() => {
            const token = signTokenWith({ ...ctx.basicValidPayload, data: ctx.data }, authConfig.otherAuthPrivateKey, '10000ms')
            expect(() => env.jwtVerifier.verifyAndDecode(token)).toThrow(UnauthorizedError)
        })
    })

    interface Ctx {
        basicValidPayload: Record<string, unknown>
        appDefId: string
        requestPayload: string
        metadata: string
        data: Record<string, unknown>
    }

    const ctx: Ctx = {
        basicValidPayload: Uninitialized,
        appDefId: Uninitialized,
        requestPayload: Uninitialized,
        data: Uninitialized,
        metadata: Uninitialized,
    }

    interface Env {
        jwtVerifier: JWTVerifier
    }

    const env: Env = {
        jwtVerifier: Uninitialized,
    }

    beforeEach(() => {
        ctx.appDefId = chance.word()
        ctx.requestPayload = chance.word()
        ctx.metadata = chance.word()
        ctx.basicValidPayload = { iss: TOKEN_ISSUER, aud: ctx.appDefId }
        ctx.data = { request: ctx.requestPayload, metadata: ctx.metadata }
        env.jwtVerifier = new JWTVerifier(authConfig.authPublicKey, ctx.appDefId)
    })
})

const signedToken = (payload: Record<string, unknown>, expiration = '10000ms') => signTokenWith(payload, authConfig.authPrivateKey, expiration)


const signTokenWith = (payload: Record<string, unknown>, privateKey: string, expiration: string) => {
    const options: jwt.SignOptions = { algorithm: 'RS256', expiresIn: expiration }
    return jwt.sign(payload, privateKey, options)
}
