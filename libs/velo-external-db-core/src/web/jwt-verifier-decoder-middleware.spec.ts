import * as Chance from 'chance'
import { Request, Response } from 'express'
import { Uninitialized, gen as genCommon } from '@wix-velo/test-commons'
import { JWTVerifierDecoderMiddleware } from './jwt-verifier-decoder-middleware'
import * as driver from './jwt-verifier-test-support'
import { errors } from '@wix-velo/velo-external-db-commons'

const { UnauthorizedError } = errors
const chance = Chance()

describe('Jwt Verifier Decoder Middleware', () => {
    test('given valid token, should decode and override request body', async() => {
        driver.givenValidToken(ctx.token, ctx.decodedToken)
        env.JwtVerifierDecoderMiddleware.verifyAndDecodeMiddleware()(ctx.req, ctx.res, ctx.next)
        expect(ctx.req.body).toEqual({ ...ctx.decodedToken.request, metadata: ctx.decodedToken.metadata })
    })

    test('given invalid token, should throw error', async() => {
        driver.givenInvalidToken(ctx.token, ctx.errorMsgFromVerifier)
        env.JwtVerifierDecoderMiddleware.verifyAndDecodeMiddleware()(ctx.req, ctx.res, ctx.next)
        expect(ctx.next).toHaveBeenCalledWith(new UnauthorizedError(ctx.errorMsgFromVerifier))
    })
    
    interface Env {
        JwtVerifierDecoderMiddleware: JWTVerifierDecoderMiddleware
    }
    const env: Env = {
        JwtVerifierDecoderMiddleware: Uninitialized,
    }

    interface Ctx {
        token: string,
        req: Request
        res: Response
        next: jest.Mock
        decodedToken: any
        errorMsgFromVerifier: string
    }

    const ctx: Ctx = {
        token: Uninitialized,
        req: Uninitialized,
        res: Uninitialized,
        next: Uninitialized,
        decodedToken: Uninitialized,
        errorMsgFromVerifier: Uninitialized,
    }

    beforeEach(() => {
        ctx.token = chance.string()
        ctx.req = {
            ...genCommon.randomObject(),
            body: ctx.token,
        } as Request
        ctx.res = genCommon.randomObject() as Response
        ctx.next = jest.fn()
        ctx.decodedToken = {
            request: genCommon.randomObject(),
            metadata: genCommon.randomObject(),
        }
        ctx.errorMsgFromVerifier = chance.string()

        env.JwtVerifierDecoderMiddleware = new JWTVerifierDecoderMiddleware(driver.jwtVerifier)
    })
})
