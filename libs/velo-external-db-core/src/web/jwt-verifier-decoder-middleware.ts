import { Request, Response, NextFunction } from 'express'
import { JWTVerifier } from './jwt-verifier'

export class JWTVerifierDecoderMiddleware {
    private jwtVerifier: JWTVerifier

    constructor(jwtVerifier: any) {
        this.jwtVerifier = jwtVerifier
    }

    verifyAndDecodeMiddleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = this.jwtVerifier.verifyAndDecode(req.body)
                next()
            }
            catch (error) {
                next(error)
            }
        }
    }
}
