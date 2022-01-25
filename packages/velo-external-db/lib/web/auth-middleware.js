const { property } = require('./middleware-support')
const { UnauthorizedError } = require('velo-external-db-commons').errors

let validAuthService, authConfigReader

const initAuthMiddleware = (_validAuthService, _authConfigReader ) => {
  validAuthService = _validAuthService
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
    if (!validAuthService || !req.user) {
        const authConfigReaderStatus = await authConfigReader.configStatus()
        return res.render('login', { authConfigReaderStatus })
      }
  
      next()
}

module.exports = { authMiddleware, secretKeyAuthMiddleware, initAuthMiddleware }
