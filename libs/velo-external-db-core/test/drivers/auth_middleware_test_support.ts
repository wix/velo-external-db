import { IWixDataFacade } from '../../src/web/wix_data_facade'
import * as jwt from 'jsonwebtoken'
import { decodeBase64 } from '../../src/utils/base64_utils'
import { authConfig } from '@wix-velo/test-commons'


export const requestBodyWith = (role?: string | undefined, path?: string | undefined, authHeader?: string | undefined) => ({
    path: path || '/',
    body: {
        requestContext: {
            role: role || 'OWNER',
            settings: {
            } } },
    header(_name: string) { return authHeader }
} )

export const signedToken = (payload: Object, expiration= '10000ms') =>
    jwt.sign(payload, decodeBase64(authConfig.authPrivateKey), { algorithm: 'RS256', expiresIn: expiration })

export class WixDataFacadeMock implements IWixDataFacade {
    publicKeys: string[]
    index: number

    constructor(...publicKeys: string[]) {
        this.publicKeys = publicKeys
        this.index = 0
    }

    getPublicKey(_externalDatabaseId: string): Promise<string> {
        const publicKeyToReturn = this.publicKeys[this.index]
        if (this.index < this.publicKeys.length-1) {
            this.index++
        }
        return Promise.resolve(publicKeyToReturn)
    }
}
