const { isJson, jsonParser } = require('../utils/config_utils')

class AuthorizationConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PERMISSIONS: roleConfig } = process.env

    return isJson(roleConfig) ? jsonParser(roleConfig) : roleConfig
  }
}

module.exports = AuthorizationConfigReader 
