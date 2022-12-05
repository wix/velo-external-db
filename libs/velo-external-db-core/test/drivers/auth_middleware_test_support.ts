import { IWixDataFacade } from '../../src/web/wix_data_facade'
import * as jwt from 'jsonwebtoken'
import { decodeBase64 } from '../../src/utils/base64_utils'
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

export const signedToken = (payload: Object, keyid?: string, expiration= '10000ms') => {
    let options = keyid ? {algorithm: 'RS256', expiresIn: expiration, keyid: keyid} : {algorithm: 'RS256', expiresIn: expiration};
    return jwt.sign(payload, decodeBase64(authConfig.authPrivateKey), options as SignOptions)
}

export class WixDataFacadeMock implements IWixDataFacade {
    publicKeys: { [key: string]: string }[]
    index: number

    constructor(...publicKeys: { [key: string]: string }[]) {
        this.publicKeys = publicKeys
        this.index = 0
    }

    getPublicKeys(_externalDatabaseId: string): Promise<{ [key: string]: string }> {
        const publicKeyToReturn = this.publicKeys[this.index]
        if (this.index < this.publicKeys.length-1) {
            this.index++
        }
        return Promise.resolve(publicKeyToReturn)
    }
}
