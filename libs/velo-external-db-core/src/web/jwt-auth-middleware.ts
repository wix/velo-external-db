import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import { JwtHeader, JwtPayload, SigningKeyCallback, verify } from 'jsonwebtoken'
import * as express from 'express'
import { IWixDataFacade } from './wix_data_facade'


export const TOKEN_ISSUER = 'wix-data.wix.com'

export class JwtAuthenticator {
    publicKeys: { [key: string]: string } | undefined
    externalDatabaseId: string
    allowedMetasites: string[]
    wixDataFacade: IWixDataFacade

    constructor(externalDatabaseId: string, allowedMetasites: string, wixDataFacade: IWixDataFacade) {
        this.externalDatabaseId = externalDatabaseId
        this.allowedMetasites = allowedMetasites.split(',')
        this.wixDataFacade = wixDataFacade
    }

    authorizeJwt() {
        return async(req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                const token = this.extractToken(req.header('Authorization'))
                this.publicKeys = this.publicKeys ?? await this.wixDataFacade.getPublicKeys(this.externalDatabaseId)
                await this.verify(token)
            } catch (err: any) {
                console.error('Authorization failed: ' + err.message)
                next(new UnauthorizedError('You are not authorized'))
            }
            next()
        }
    }

    getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
        if (header.kid === undefined) {
            callback(new UnauthorizedError('No kid set on JWT header'))
            return
        }
        const publicKey = this.publicKeys![header.kid!];
        if (publicKey === undefined) {
            callback(new UnauthorizedError(`No public key fetched for kid ${header.kid}. Available keys: ${JSON.stringify(this.publicKeys)}`))
        } else {
            callback(null, publicKey)
        }
    }

    verifyJwt = (token: string) => {
        return new Promise<JwtPayload | string>((resolve, reject) =>
            verify(token, this.getKey, {audience: this.externalDatabaseId, issuer: TOKEN_ISSUER}, (err, decoded) =>
                (err) ? reject(err) : resolve(decoded!)
            ));
    }


    async verifyWithRetry(token: string): Promise<JwtPayload | string> {
        try {
            return await this.verifyJwt(token);
        } catch (err) {
            this.publicKeys = await this.wixDataFacade.getPublicKeys(this.externalDatabaseId)
            return await this.verifyJwt(token);
        }
    }

    async verify(token: string) {
        const { siteId } = await this.verifyWithRetry(token) as JwtPayload
        if (siteId === undefined || !this.allowedMetasites.includes(siteId)) {
            throw new UnauthorizedError(`Unauthorized: ${siteId ? `site not allowed ${siteId}` : 'no siteId'}`)
        }
    }

    private extractToken(header: string | undefined) {
        if (header===undefined) {
            throw new UnauthorizedError('No Authorization header')
        }
        return header.replace(/^(Bearer )/, '')
    }
}


