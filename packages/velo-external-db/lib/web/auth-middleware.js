const { property } = require('./middleware-support')
const { UnauthorizedError } = require('velo-external-db-commons').errors

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

const authMiddleware = (req, res, next) => {
    if (!req.user) 
        return res.render('login')
    else
        next()
}

module.exports = { authMiddleware, secretKeyAuthMiddleware }
