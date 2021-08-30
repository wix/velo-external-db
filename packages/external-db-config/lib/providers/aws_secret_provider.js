const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('./secret_provider_utils')

const SecretId = 'VELO-EXTERNAL-DB-SECRETS'
const EmptyAWSConfig = { host: '', username: '', password: '', DB: '', SECRET_KEY: '' }

class AwsSecretProvider {
  constructor (region) {
    this.region = region
  }

  async getSecrets() {
    const cfg = await this.readConfig()
                          .catch(() => EmptyAWSConfig)
    const { host, username, password, DB, SECRET_KEY } = cfg
    return { host: host, user: username, password: password, db: DB, secretKey: SECRET_KEY }
  }

  async readConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId }))
    return JSON.parse(data.SecretString)
  }

  async validate() {
    try {
      const cfg = await this.readConfig()
      return { missingRequiredSecretsKeys: checkRequiredKeys(cfg, ['host', 'username', 'password', 'DB', 'SECRET_KEY']) }
    } catch (err) {
      return { configReadError: err.message, missingRequiredSecretsKeys: [] }
    }
  }

}

module.exports = { AwsSecretProvider }
