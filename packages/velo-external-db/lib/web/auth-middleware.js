const { property } = require('./middleware-support')
const { UnauthorizedError } = require('velo-external-db-commons').errors

let isValidAuthService, authConfigReader

const initAuthMiddleware = (_isValidAuthService, _authConfigReader) => {
    isValidAuthService = _isValidAuthService
    authConfigReader = _authConfigReader
}

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

const authMiddleware = async(req, res, next) => {
    if (!isValidAuthService || !req.user) {
        const authConfigReaderStatus = await authConfigReader.configStatus()
        return res.render('login', { authConfigReaderStatus })
      }
  
      next()
}

module.exports = { authMiddleware, secretKeyAuthMiddleware, initAuthMiddleware }
