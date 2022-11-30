import { errors } from '@wix-velo/velo-external-db-commons'
const { UnauthorizedError } = errors
import { JwtPayload, Secret, verify } from 'jsonwebtoken'
import * as express from 'express'
import { IWixDataFacade } from './wix_data_facade'


export const TOKEN_ISSUER = 'wix-data.wix.com'

export class JwtAuthenticator {
    publicKey: string | undefined
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
                this.publicKey = this.publicKey ?? await this.wixDataFacade.getPublicKey(this.externalDatabaseId)
                await this.verify(token)
            } catch (err: any) {
                console.error('Authorization failed: ' + err.message)
                next(new UnauthorizedError('You are not authorized'))
            }
            next()
        }
    }

    async verifyWithRetry(token: string): Promise<JwtPayload | string> {
        try {
            return verify(token, this.publicKey as Secret)
        } catch (err) {
            this.publicKey = await this.wixDataFacade.getPublicKey(this.externalDatabaseId)
            return verify(token, this.publicKey as Secret)
        }
    }

    async verify(token: string) {
        const { iss, metasite } = await this.verifyWithRetry(token) as JwtPayload

        if (iss !== TOKEN_ISSUER) {
            throw new UnauthorizedError(`Unauthorized: ${iss ? `wrong issuer ${iss}` : 'no issuer'}`)
        }
        if (metasite === undefined || !this.allowedMetasites.includes(metasite)) {
            throw new UnauthorizedError(`Unauthorized: ${metasite ? `metasite not allowed ${metasite}` : 'no metasite'}`)
        }
    }

    private extractToken(header: string | undefined) {
        if (header===undefined) {
            throw new UnauthorizedError('No Authorization header')
        }
        return header.replace(/^(Bearer )/, '')
    }
}


