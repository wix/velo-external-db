const { createAuthService } = require('./factory')
const RoleAuthorizationService = require ('./services/role_authorization')

module.exports = { createAuthService, RoleAuthorizationService }
