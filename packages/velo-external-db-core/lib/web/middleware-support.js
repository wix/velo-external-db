const { UnauthorizedError } = require('velo-external-db-commons').errors
const { has, get } = require('nested-property')

const unless = function(path, middleware) {
    return function(req, res, next) {
        if (path.includes(req.path)) {
            return next()
        } else {
            return middleware(req, res, next)
        }
    }
}

const includes = function(path, middleware) {
    return function(req, res, next) {
        if (path.some(p => req.path.startsWith(p))) {
            return middleware(req, res, next)
        } else {
            return next()
        }
    }
}

const property = (prop, body) => {
    if (!has(body, prop)) {
        throw new UnauthorizedError('You are not authorized')
    }
    return get(body, prop)
}


module.exports = { unless, includes, property }