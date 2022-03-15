const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('../utils/config_utils')

const emptyConfig = (err) => ({ secretMangerError: err.message })

class AwsConfigReader {
  constructor(secretId, region) {
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { config } = await this.getExternalAndLocalEnvs()
    const { host, username, password, DB, SECRET_KEY } = config
    return { host: host, user: username, password: password, db: DB, secretKey: SECRET_KEY }
  }

  async readExternalConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async getExternalAndLocalEnvs() { 
    const externalConfig = await this.readExternalConfig().catch(emptyConfig)
    const { host, username, password, DB, SECRET_KEY, HOST, PASSWORD, USER } = { ...process.env, ...externalConfig }
    const config = {  host: host || HOST, username: username || USER, password: password || PASSWORD, DB, SECRET_KEY }
    return { config, secretMangerError: externalConfig.secretMangerError }
  }

  async validate() {
      const { config, secretMangerError } = await this.getExternalAndLocalEnvs()
      return { missingRequiredSecretsKeys: checkRequiredKeys(config, ['host', 'username', 'password', 'DB', 'SECRET_KEY']), secretMangerError }
  }
}

class AwsDynamoConfigReader {
  constructor(region, secretId) {
    this.region = region
    this.secretId = secretId
    }

    async readConfig() {
      const { config } = await this.getExternalAndLocalEnvs()
  
      return { region: this.region, secretKey: config.SECRET_KEY }
    }
    
    async getExternalAndLocalEnvs() { 
      const externalConfig = await this.readExternalConfig().catch(emptyConfig)
      const { SECRET_KEY } = { ...process.env, ...externalConfig }
      const config = { SECRET_KEY }

      return { config, secretMangerError: externalConfig.secretMangerError }
    }

    async readExternalConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async validate() {
    const { config, secretMangerError } = await this.getExternalAndLocalEnvs()
    return { missingRequiredSecretsKeys: checkRequiredKeys(config, ['SECRET_KEY']), secretMangerError }
  }
}

class AwsMongoConfigReader {
  constructor(region, secretId) {
    this.region = region
    this.secretId = secretId
    }

    async readExternalConfig() {
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async getExternalAndLocalEnvs() { 
    const externalConfig = await this.readExternalConfig().catch(emptyConfig)
    const { SECRET_KEY, URI } = { ...process.env, ...externalConfig }
    const config = { SECRET_KEY, URI }

    return { config, secretMangerError: externalConfig.secretMangerError }
  }

  async readConfig() {
    const { config } = await this.getExternalAndLocalEnvs()

    const { SECRET_KEY, URI } = config

    return { secretKey: SECRET_KEY, connectionUri: URI }
  }

  async validate() {
      const { config, secretMangerError } = await this.getExternalAndLocalEnvs()
      return { missingRequiredSecretsKeys: checkRequiredKeys(config, ['URI', 'SECRET_KEY']), secretMangerError }
  }
}

module.exports = { AwsConfigReader, AwsDynamoConfigReader, AwsMongoConfigReader }
