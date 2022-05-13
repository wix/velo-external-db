const { checkRequiredKeys } = require('../utils/config_utils')

class AzureConfigReader {
  constructor() {
  }

  async readConfig() {
    const { HOST, USER, PASSWORD, DB, SECRET_KEY, UNSECURED_ENV } = process.env
    return { host: HOST, user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY, unsecuredEnv: UNSECURED_ENV }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['HOST', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY'])
    }
  }
}

module.exports = { AzureConfigReader }
