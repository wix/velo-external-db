const nestedProperty = require('nested-property')
const { UnauthorizedError } = require('velo-external-db-commons').errors

const AdminPermission = ['OWNER', 'BACKEND_CODE']
const OwnerPermission = ['OWNER']

const property = (prop, body) => {
    if (!nestedProperty.has(body, prop)) {
        throw new UnauthorizedError('You are not authorized')
    }
    return nestedProperty.get(body, prop)
}

const extractSecretKey = body => property('requestContext.settings.secretKey', body)
const extractRole = body => property('requestContext.role', body)

const authorizeSecretKey = (req, secretKey) => {
    if (extractSecretKey(req.body) !== secretKey) {
        throw new UnauthorizedError('You are not authorized')
    }
}

const authorizeRole = (req) => {
    let authorized = false
    const path = req.path || '/'

    if (path.startsWith('/provision')) {
        authorized = true
    }

    if (path.startsWith('/data')) {
        const role = extractRole(req.body)
        if (!AdminPermission.includes(role)) {
            throw new UnauthorizedError('You are not authorized')
        }
        authorized = true
    }

    if (path.startsWith('/schemas')) {
        const role = extractRole(req.body)
        if (!OwnerPermission.includes(role)) {
            throw new UnauthorizedError('You are not authorized')
        }
        authorized = true
    }

    if (!authorized) {
        throw new UnauthorizedError('You are not authorized')
    }

}

function authMiddleware ({ secretKey }) {
    return (req, res, next) => {
        authorizeRole(req)
        authorizeSecretKey(req, secretKey)
        next()
    }
}

module.exports = { authMiddleware }
