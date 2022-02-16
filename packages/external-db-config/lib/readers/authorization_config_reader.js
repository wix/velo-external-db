const { checkRequiredKeys, isJson, EMPTY_ROLE_CONFIG, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj()

class AuthorizationConfigReader {
  constructor() {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
  }

  async readConfig() {
    const { ROLE_CONFIG } = process.env
    const { collectionLevelConfig } = isJson(ROLE_CONFIG) ? JSON.parse(ROLE_CONFIG) : EMPTY_ROLE_CONFIG

    return collectionLevelConfig.filter(collection => this.collectionValidator(collection))
  }

  validate() {
    const { ROLE_CONFIG } = process.env

    return {
      valid: isJson(ROLE_CONFIG) && this.configValidator(JSON.parse(ROLE_CONFIG)),
      message: this.configValidator.errors ? this.configValidator.errors.map(e => e.message).join(', ') : 'Authorization config is valid',
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['ROLE_CONFIG'])
    }
  }
}

module.exports = AuthorizationConfigReader 
