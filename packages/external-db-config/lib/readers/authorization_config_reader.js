const { checkRequiredKeys, isJson, EmptyRoleConfig, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj()

class AuthorizationConfigReader {
  constructor() {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
  }

  async readConfig() {
    const { roleConfig: roleConfig } = process.env
    const { collectionLevelConfig } = isJson(roleConfig) ? JSON.parse(roleConfig) : EmptyRoleConfig
    return collectionLevelConfig.filter(collection => this.collectionValidator(collection))
  }

  validate() {
    const { roleConfig: roleConfig } = process.env
    
    const valid = isJson(roleConfig) && this.configValidator(JSON.parse(roleConfig))
    let message 
    

    if (checkRequiredKeys(process.env, ['roleConfig']).length)  
      message = 'Role config is not defined, using default'
    else if (!isJson(roleConfig)) 
      message = 'Role config is not valid JSON'
    else if (!valid)
      message = this.configValidator.errors.map(err => (`Error in ${err.instancePath}: ${err.message}`)).join(', ')
    else 
      message = 'Authorization Config read successfully'

    return { valid, message }
  }
}

module.exports = AuthorizationConfigReader 
