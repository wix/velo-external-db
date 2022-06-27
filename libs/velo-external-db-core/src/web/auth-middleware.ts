import { property } from './middleware-support'
import { errors } from '@wix-velo/velo-external-db-commons'
import { Request } from 'express'
const { UnauthorizedError } = errors


const extractSecretKey = (body: any) => property('requestContext.settings.secretKey', body)

const authorizeSecretKey = (req: Request, secretKey: string) => {
    if (extractSecretKey(req.body) !== secretKey) {
        throw new UnauthorizedError('You are not authorized')
    }
}

export const secretKeyAuthMiddleware = ({ secretKey }: {secretKey: string}) => {
    return (req: any, res: any, next: () => void) => {
        authorizeSecretKey(req, secretKey)
        next()
    }
}
