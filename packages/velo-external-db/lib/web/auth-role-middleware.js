const { UnauthorizedError } = require('velo-external-db-commons').errors
const { property } = require('./middleware-support')

const extractRole = body => property('requestContext.role', body)

const authorizeRole = (req, roles) => {
    const role = extractRole(req.body)
    if (!roles.includes(role)) {
        throw new UnauthorizedError('You are not authorized')
    }
}

function authRoleMiddleware( { roles } ) {
    return (req, res, next) => {
        authorizeRole(req, roles)
        next()
    }
}

module.exports = { authRoleMiddleware }
