const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('../utils/config_utils')

const EmptyAWSAuthConfig = { callbackurl: '', clientid: '', clientsecret: '', clientdomain: '' }

class AwsAuthConfigReader {
  constructor(secretId, region) {
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const cfg = await this.readExternalConfig()
                          .catch(() => EmptyAWSAuthConfig)
    const { CALLBACKURL, CLIENTID, CLIENTSECRET, CLIENTDOMAIN } = cfg
    return { callbackurl: CALLBACKURL, clientid: CLIENTID, clientsecret: CLIENTSECRET, clientdomain: CLIENTDOMAIN }
  }

  async readExternalConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async validate() {
    try {
      const cfg = await this.readExternalConfig()
      return { missingRequiredSecretsKeys: checkRequiredKeys(cfg, ['CALLBACKURL', 'CLIENTID', 'CLIENTSECRET', 'CLIENTDOMAIN']) }
    } catch (err) {
      return { configReadError: err.message, missingRequiredSecretsKeys: [] }
    }
  }
}


module.exports = { AwsAuthConfigReader }
