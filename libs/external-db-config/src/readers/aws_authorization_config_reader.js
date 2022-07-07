const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { isJson, jsonParser } = require('../utils/config_utils')
const emptyExternalDbConfig = (err) => ({ externalConfig: {}, secretMangerError: err.message })

class AwsAuthorizationConfigReader {
  constructor(region, secretId) {
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()
    const { PERMISSIONS: roleConfig } = config

    return isJson(roleConfig) ? jsonParser(roleConfig) : roleConfig
  }

  async readExternalConfig() { 
    try {
      const client = new SecretsManagerClient({ region: this.region })
      const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
      return { externalConfig: JSON.parse(data.SecretString) }
    } catch (err) {
      return emptyExternalDbConfig(err)
    }
  }

  async readExternalAndLocalConfig() {
    const { externalConfig, secretMangerError } = await this.readExternalConfig()
    const { PERMISSIONS } = { ...process.env, ...externalConfig }
    const config = { PERMISSIONS }
    return { config, secretMangerError: secretMangerError }
  }
}

module.exports = AwsAuthorizationConfigReader 
