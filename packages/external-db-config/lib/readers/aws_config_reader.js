const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('../utils/secret_provider_utils')

const SecretId = 'VELO-EXTERNAL-DB-SECRETS'
const EmptyAWSConfig = { host: '', username: '', password: '', DB: '', SECRET_KEY: '' }

class AwsConfigReader {
  constructor (region) {
    this.region = region
  }

  async readConfig() {
    const cfg = await this.readExternalConfig()
                          .catch(() => EmptyAWSConfig)
    const { host, username, password, DB, SECRET_KEY } = cfg
    return { host: host, user: username, password: password, db: DB, secretKey: SECRET_KEY }
  }

  async readExternalConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId }))
    return JSON.parse(data.SecretString)
  }

  async validate() {
    try {
      const cfg = await this.readExternalConfig()
      return { missingRequiredSecretsKeys: checkRequiredKeys(cfg, ['host', 'username', 'password', 'DB', 'SECRET_KEY']) }
    } catch (err) {
      return { configReadError: err.message, missingRequiredSecretsKeys: [] }
    }
  }
}

module.exports = AwsConfigReader
