const { checkRequiredKeys, isJson, jsonParser, EmptyRoleConfig, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj({ strict: false })

class AuthorizationConfigReader {
  constructor() {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
  }

  async readConfig() {
    const { ROLE_CONFIG: roleConfig } = process.env

    const { collectionLevelConfig } = (isJson(roleConfig) && Array.isArray( (jsonParser(roleConfig)).collectionLevelConfig ) ) ? jsonParser(roleConfig) : EmptyRoleConfig

    return collectionLevelConfig.filter(collection => this.collectionValidator(collection))
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
