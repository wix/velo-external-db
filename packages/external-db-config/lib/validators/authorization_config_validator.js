const { EmptyRoleConfig, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj({ strict: false })

class AuthorizationConfigValidator {
  constructor(config) {
    this.config = config || EmptyRoleConfig

    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
  }

  readConfig() {
    const { roleConfig } = this.config
    const { collectionPermissions } = roleConfig && roleConfig.collectionPermissions ? roleConfig : EmptyRoleConfig

    return collectionPermissions.filter(collection => this.collectionValidator(collection))
  }

  validate() {
    const { roleConfig } = this.config
    
    const valid = this.configValidator(roleConfig)
    let message 
    
    if (!this.config || !this.config.roleConfig)  
      message = 'Role config is not defined, using default'
    else if (!valid)
      message = this.configValidator.errors.map(err => (`Error in ${err.instancePath}: ${err.message}`)).join(', ')
    else 
      message = 'Authorization Config read successfully'

    return { valid, message }
  }
}

module.exports = { AuthorizationConfigValidator } 
