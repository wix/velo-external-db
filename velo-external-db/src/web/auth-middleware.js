const nestedProperty = require('nested-property')
const { UnauthorizedError } = require('../error/errors')

const extractSecretKey = body => {
    if (!nestedProperty.has(body, 'requestContext.settings.secretKey')) {
        console.log('authMiddleware', body)
        throw new UnauthorizedError('You are not authorized')
    }
    return nestedProperty.get(body, 'requestContext.settings.secretKey')
}

function authMiddleware ({ secretKey }) {
    return (req, res, next) => {
        if (extractSecretKey(req.body) !== secretKey) {
            console.log('authMiddleware', req)
            throw new UnauthorizedError('You are not authorized')
        }
        next()
    }
}

module.exports = { authMiddleware }
