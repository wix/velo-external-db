import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { IConfigReader } from '../types'

const emptyExternalDbConfig = (err: any) => ({ externalConfig: {}, secretMangerError: err.message })

export class AwsConfigReader implements IConfigReader {
  secretId: string
  region: string | undefined
  constructor(secretId: string, region: string | undefined) {
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()
    const { host, username, password, DB, SECRET_KEY, DB_PORT } = config
    return { host: host, user: username, password: password, db: DB, secretKey: SECRET_KEY, port: DB_PORT }
  }

  async readExternalConfig() {
    try {
      const client = new SecretsManagerClient({ region: this.region })
      const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
      return { externalConfig: JSON.parse(data.SecretString || '') }
    } catch (err) {
      return emptyExternalDbConfig(err)
    }
  }

  async readExternalAndLocalConfig() { 
    const { externalConfig, secretMangerError }: {[key: string]: any} = await this.readExternalConfig()
    const { host, username, password, DB, SECRET_KEY, HOST, PASSWORD, USER, DB_PORT }: {[key: string]: string} = { ...process.env, ...externalConfig }
    const config = {  host: host || HOST, username: username || USER, password: password || PASSWORD, DB, SECRET_KEY, DB_PORT }
    return { config, secretMangerError }
  }
}

export class AwsDynamoConfigReader implements IConfigReader {
  region: string | undefined
  secretId: string
  constructor(region: string | undefined, secretId: string) {
    this.region = region
    this.secretId = secretId
    }

    async readConfig() {
      const { config } = await this.readExternalAndLocalConfig()
      if (process.env['NODE_ENV'] === 'test') {
        return { region: this.region, secretKey: config.SECRET_KEY, endpoint: process.env['ENDPOINT_URL'] }
      }
      return { region: this.region, secretKey: config.SECRET_KEY }
    }
    
    async readExternalAndLocalConfig() { 
      const { externalConfig, secretMangerError }: {[key: string]: any} = await this.readExternalConfig()
      const { SECRET_KEY = undefined } = { ...process.env, ...externalConfig }
      const config = { SECRET_KEY }

      return { config, secretMangerError: secretMangerError }
    }

    async readExternalConfig() {
      try {
        const client = new SecretsManagerClient({ region: this.region })
        const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
        return { externalConfig: JSON.parse(data.SecretString || '') }
      } catch (err) {
        return emptyExternalDbConfig(err)
      }
  }
}

export class AwsMongoConfigReader implements IConfigReader {
  region: string | undefined
  secretId: string
  constructor(region: string | undefined, secretId: string) {
    this.region = region
    this.secretId = secretId
    }

    async readExternalConfig() {
      try {
        const client = new SecretsManagerClient({ region: this.region })
        const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
        return { externalConfig: JSON.parse(data.SecretString || '') }
      } catch (err) {
        return emptyExternalDbConfig(err)
      }
    }

  async readExternalAndLocalConfig() { 
    const { externalConfig, secretMangerError } :{[key: string]: any} = await this.readExternalConfig()
    const { SECRET_KEY, URI }: {SECRET_KEY: string, URI: string} = { ...process.env, ...externalConfig }
    const config = { SECRET_KEY, URI }

    return { config, secretMangerError: secretMangerError }
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()

    const { SECRET_KEY, URI } = config

    return { secretKey: SECRET_KEY, connectionUri: URI }
  }
}
