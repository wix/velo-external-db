const { checkRequiredKeys, isJson, EMPTY_ROLE_CONFIG } = require('../utils/config_utils')

class AuthorizationConfigReader {
  constructor() {
  }

  async readConfig() {
    const { ROLE_CONFIG } = process.env
    const { collectionLevelConfig } = isJson(ROLE_CONFIG) ? JSON.parse(ROLE_CONFIG) : EMPTY_ROLE_CONFIG
    return collectionLevelConfig
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, [])
    }
  }
}

module.exports = AuthorizationConfigReader 
