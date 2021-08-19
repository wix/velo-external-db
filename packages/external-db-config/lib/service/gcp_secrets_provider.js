
const { SecretsProvider } = require('./secrets_provider')

class GcpSecretsProvider extends SecretsProvider {
  constructor () {
    super()
    this.requiredSecretsKeys = ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY']
  }

  async getSecrets () {
    const { CLOUD_SQL_CONNECTION_NAME: cloudSqlConnectionName, USER: user, PASSWORD: password, DB: db, SECRET_KET: secretKey } = process.env
    return { cloudSqlConnectionName, user, password, db, secretKey }
  }
}

module.exports = { GcpSecretsProvider }
