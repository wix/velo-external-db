const { checkRequiredKeys } = require('./secret_provider_utils')

class GcpSecretProvider {
  constructor () {
    this.secret = {}
    this.requiredSecretsKeys = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY']
  }

  async getSecrets () {
    const { CLOUD_SQL_CONNECTION_NAME, USER, PASSWORD, DB, SECRET_KEY } = process.env
    this.secret = { CLOUD_SQL_CONNECTION_NAME, USER, PASSWORD, DB, SECRET_KEY }
    return { cloudSqlConnectionName : CLOUD_SQL_CONNECTION_NAME, user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY }
  }

  validateSecrets = () => checkRequiredKeys (this.secret,this.requiredSecretsKeys)
}

module.exports = { GcpSecretProvider }
