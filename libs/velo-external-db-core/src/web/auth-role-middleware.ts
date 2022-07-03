import { errors } from '@wix-velo/velo-external-db-commons'
import { Request } from 'express'
import { property } from './middleware-support'
const { UnauthorizedError } = errors

export const extractRole = (body: any) => property('requestContext.role', body)

const authorizeRole = (req: Request, roles: string | any[]) => {
    const role = extractRole(req.body)
    if (!roles.includes(role)) {
        throw new UnauthorizedError('You are not authorized')
    }
}

export function authRoleMiddleware( { roles }: { roles: string | any[] } ) {
    return (req: any, res: any, next: () => void) => {
        authorizeRole(req, roles)
        next()
    }
}
