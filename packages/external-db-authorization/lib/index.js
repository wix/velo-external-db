const { AuthenticationService } = require('./services/authentication_service')
const { initAuthProvider } = require('./factory')

module.exports = { initAuthProvider, AuthenticationService }
