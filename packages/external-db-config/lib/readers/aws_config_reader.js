const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('../utils/config_utils')

const emptyExternalDbConfig = (err) => ({ externalConfig: {}, secretMangerError: err.message })
const DefaultRequiredKeys = ['host', 'username', 'password', 'DB', 'SECRET_KEY']
const DynamoRequiredKeys = ['SECRET_KEY']
const MongoRequiredKeys = ['URI', 'SECRET_KEY']

class AwsConfigReader {
  constructor(secretId, region) {
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()
    const { host, username, password, DB, SECRET_KEY } = config
    return { host: host, user: username, password: password, db: DB, secretKey: SECRET_KEY }
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
    const { host, username, password, DB, SECRET_KEY, HOST, PASSWORD, USER } = { ...process.env, ...externalConfig }
    const config = {  host: host || HOST, username: username || USER, password: password || PASSWORD, DB, SECRET_KEY }
    return { config, secretMangerError: secretMangerError }
  }

  async validate() {
      const { config, secretMangerError } = await this.readExternalAndLocalConfig()
      return { missingRequiredSecretsKeys: checkRequiredKeys(config, DefaultRequiredKeys), secretMangerError }
  }
}

class AwsDynamoConfigReader {
  constructor(region, secretId) {
    this.region = region
    this.secretId = secretId
    }

    async readConfig() {
      const { config } = await this.readExternalAndLocalConfig()
      if (process.env.NODE_ENV === 'test') {
        return { region: this.region, secretKey: config.SECRET_KEY, endpoint: process.env.ENDPOINT_URL }
      }
      return { region: this.region, secretKey: config.SECRET_KEY }
    }
    
    async readExternalAndLocalConfig() { 
      const { externalConfig, secretMangerError } = await this.readExternalConfig()
      const { SECRET_KEY } = { ...process.env, ...externalConfig }
      const config = { SECRET_KEY }

      return { config, secretMangerError: secretMangerError }
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

  async validate() {
    const { config, secretMangerError } = await this.readExternalAndLocalConfig()
    return { missingRequiredSecretsKeys: checkRequiredKeys(config, DynamoRequiredKeys), secretMangerError }
  }
}

class AwsMongoConfigReader {
  constructor(region, secretId) {
    this.region = region
    this.secretId = secretId
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
    const { SECRET_KEY, URI } = { ...process.env, ...externalConfig }
    const config = { SECRET_KEY, URI }

    return { config, secretMangerError: secretMangerError }
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()

    const { SECRET_KEY, URI } = config

    return { secretKey: SECRET_KEY, connectionUri: URI }
  }

  async validate() {
      const { config, secretMangerError } = await this.readExternalAndLocalConfig()
      return { missingRequiredSecretsKeys: checkRequiredKeys(config, MongoRequiredKeys), secretMangerError }
  }
}

module.exports = { AwsConfigReader, AwsDynamoConfigReader, AwsMongoConfigReader }
