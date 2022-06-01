const { property } = require('./middleware-support')
const { UnauthorizedError } = require('@wix-velo/velo-external-db-commons').errors

const extractSecretKey = body => property('requestContext.settings.secretKey', body)

const authorizeSecretKey = (req, secretKey) => {
    if (extractSecretKey(req.body) !== secretKey) {
        throw new UnauthorizedError('You are not authorized')
    }
}

const secretKeyAuthMiddleware = ({ secretKey }) => {
    return (req, res, next) => {
        authorizeSecretKey(req, secretKey)
        next()
    }
}

module.exports = { secretKeyAuthMiddleware }
