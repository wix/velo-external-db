const { checkRequiredKeys } = require('../utils/secret_provider_utils')

class AzureConfigReader {
  constructor () {
  }

  async readConfig() {
    const { HOST, USER, PASSWORD, DB, SECRET_KEY } = process.env
    return { host: HOST , user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['HOST', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY'])
    }
  }
}

module.exports = { AzureConfigReader }
