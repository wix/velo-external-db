const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { SecretsProvider } = require('./secrets_provider')
class AwsSecretsProvider extends SecretsProvider {
  constructor (region) {
    super()
    this.secretId = 'VELO-EXTERNAL-DB-SECRETS'
    this.secretMangerClient = new SecretsManagerClient({ region })

  }

  async getSecrets () {
    const getSecretsCommand = new GetSecretValueCommand({ SecretId: this.secretId })

    try {
      const data = await this.secretMangerClient.send(getSecretsCommand)
      const secrets = JSON.parse(data.SecretString)
      const { host, username: user, password, DB: db, SECRET_KEY: secretKey } = secrets
      return { host, user, password, db, secretKey }
    } catch (err) {
      throw (err)
    }
  }
}

module.exports = { AwsSecretsProvider }
