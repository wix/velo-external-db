const { property } = require('./middleware-support')
const { UnauthorizedError } = require('velo-external-db-commons').errors

let isValidAuthProvider, authConfigReader

const initAuthMiddleware = (_isValidAuthProvider, _authConfigReader) => {
    authConfigReader = _authConfigReader
    isValidAuthProvider = _isValidAuthProvider
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
    if (!isValidAuthProvider || !req.user) {
        const { message } = await authConfigReader.configStatus()
        const statusMessage = isValidAuthProvider ? 'Authorization configured successfully' : message
        return res.render('login', { isValidAuthProvider, statusMessage })
      }
  
    next()
}

module.exports = { authMiddleware, secretKeyAuthMiddleware, initAuthMiddleware }
