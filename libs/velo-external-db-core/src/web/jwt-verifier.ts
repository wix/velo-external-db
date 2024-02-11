import { verify } from 'jsonwebtoken'
import { errors } from '@wix-velo/velo-external-db-commons'

const { UnauthorizedError } = errors
export const TOKEN_ISSUER = 'wix.com'

export class JWTVerifier {
    private publicKey: string
    private appDefId: string

    constructor(publicKey: string, appDefId: string) {
        this.publicKey = publicKey
        this.appDefId = appDefId
    }

    verifyAndDecode(jwtToken: string) {
        if (!jwtToken) {
            throw new UnauthorizedError('Unauthorized')
        }

        try {
            const decodedToken: any = verify(jwtToken, this.publicKey, {
                issuer: TOKEN_ISSUER,
                audience: this.appDefId,
            })

            if (decodedToken && decodedToken.data) {
                return {
                    request: decodedToken.data.request,
                    metadata: decodedToken.data.metadata,
                }
            } else {
                throw new UnauthorizedError('Authorization failed')
            }
        } catch (error: any) {
            throw new UnauthorizedError(`Authorization failed: ${error.message}`)
        }
    }
}
