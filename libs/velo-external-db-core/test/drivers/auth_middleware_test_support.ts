import { IWixDataFacade, PublicKeyMap } from '../../src/web/wix_data_facade'
import * as jwt from 'jsonwebtoken'
import { authConfig } from '@wix-velo/test-commons'
import { SignOptions } from 'jsonwebtoken'


export const requestBodyWith = (role?: string | undefined, path?: string | undefined, authHeader?: string | undefined) => ({
    path: path || '/',
    body: {
        requestContext: {
            role: role || 'OWNER',
            settings: {
            } } },
    header(_name: string) { return authHeader }
} )

export const signedToken = (payload: Record<string, unknown>, keyid?: string, expiration= '10000ms') => {
    const options = keyid ? { algorithm: 'ES256', expiresIn: expiration, keyid } : { algorithm: 'ES256', expiresIn: expiration }
    return jwt.sign(payload, authConfig.authPrivateKey, options as SignOptions)
}

export class WixDataFacadeMock implements IWixDataFacade {
    publicKeys: PublicKeyMap[]
    index: number

    constructor(...publicKeys: PublicKeyMap[]) {
        this.publicKeys = publicKeys
        this.index = 0
    }

    getPublicKeys(_externalDatabaseId: string): Promise<PublicKeyMap> {
        const publicKeyToReturn = this.publicKeys[this.index]
        if (this.index < this.publicKeys.length-1) {
            this.index++
        }
        return Promise.resolve(publicKeyToReturn)
    }
}
