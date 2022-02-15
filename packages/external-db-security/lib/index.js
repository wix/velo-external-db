const { createAuthProviderFor } = require('./factory')
const RoleAuthorizationService = require ('./services/role_authorization')

module.exports = { createAuthProviderFor, RoleAuthorizationService }
