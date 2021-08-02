const nestedProperty = require('nested-property')
const { UnauthorizedError } = require('velo-external-db-commons').errors

const extractSecretKey = body => {
    if (!nestedProperty.has(body, 'requestContext.settings.secretKey')) {
        throw new UnauthorizedError('You are not authorized')
    }
    return nestedProperty.get(body, 'requestContext.settings.secretKey')
}

function authMiddleware ({ secretKey }) {
    return (req, res, next) => {
        if (extractSecretKey(req.body) !== secretKey) {
            throw new UnauthorizedError('You are not authorized')
        }
        next()
    }
}

module.exports = { authMiddleware }
