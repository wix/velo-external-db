const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('../utils/config_utils')

const EmptyAWSConfig = { host: '', username: '', password: '', DB: '', SECRET_KEY: '', error: true }

class AwsConfigReader {
  constructor(secretId, region) {
    this.secretId = secretId
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
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
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

  class AwsDynamoConfigReader {
    constructor(region) {
      this.region = region
     }

     async readExternalConfig() {
      const client = new SecretsManagerClient({ region: this.region })
      const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
      return JSON.parse(data.SecretString)
    }

    async readConfig() {
      if (process.env.NODE_ENV === 'test') {
        return { region: this.region, secretKey: process.env.SECRET_KEY, endpoint: process.env.ENDPOINT_URL }
      }
      const cfg = await this.readExternalConfig()
                            .catch(() => EmptyAWSConfig)
  
      const { SECRET_KEY } = cfg
      return { region: this.region, secretKey: SECRET_KEY }
    }

    validate() {
      return {
        missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['SECRET_KEY']) 
      }
    }
  }

module.exports = { AwsConfigReader, AwsDynamoConfigReader }
