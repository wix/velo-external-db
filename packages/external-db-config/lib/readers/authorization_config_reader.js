const { checkRequiredKeys, isJson, jsonParser, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj({ strict: false })

class AuthorizationConfigReader {
  constructor() {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
  }

  async readConfig() {
    const { ROLE_CONFIG: roleConfig } = process.env

    return isJson(roleConfig) ? jsonParser(roleConfig) : roleConfig
  }

  validate() {
    const { ROLE_CONFIG: roleConfig } = process.env
    
    const valid = isJson(roleConfig) && this.configValidator(jsonParser(roleConfig))
    let message 
    

    if (checkRequiredKeys(process.env, ['ROLE_CONFIG']).length)  
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
