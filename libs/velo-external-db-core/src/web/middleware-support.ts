import { errors } from '@wix-velo/velo-external-db-commons'
import { NextFunction, Request, Response } from 'express'
import { has, get } from 'nested-property'
const { UnauthorizedError } = errors

export const unless = function(path: string | any[], middleware: any) {
    return function(req: Request, res: Response, next: NextFunction) {
        if (path.includes(req.path)) {
            return next()
        } else {
            return middleware(req, res, next)
        }
    }
}

export const includes = function(path: any[], middleware: any) {
    return function(req: Request, res: Response, next: NextFunction) {
        if (path.some((p: any) => req.path.startsWith(p))) {
            return middleware(req, res, next)
        } else {
            return next()
        }
    }
}

export const property = (prop: any, body: any) => {
    if (!has(body, prop)) {
        throw new UnauthorizedError('You are not authorized')
    }
    return get(body, prop)
}
