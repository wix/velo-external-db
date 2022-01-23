const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('../utils/config_utils')

const EmptyAWSAuthConfig = { callbackUrl: '', clientId: '', clientSecret: '', clientDomain: '' }

class AwsAuthConfigReader {
  constructor(secretId, region) {
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const cfg = await this.readExternalConfig()
                          .catch(() => EmptyAWSAuthConfig)
    const { callbackUrl, clientId, clientSecret, clientDomain } = cfg
    return { callbackUrl, clientId, clientSecret, clientDomain }
  }

  async readExternalConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async validate() {
    try {
      const cfg = await this.readExternalConfig()
      return { missingRequiredSecretsKeys: checkRequiredKeys(cfg, ['callbackUrl', 'clientId', 'clientSecret', 'clientDomain']) }
    } catch (err) {
      return { configReadError: err.message, missingRequiredSecretsKeys: [] }
    }
  }
}


module.exports = { AwsAuthConfigReader }
