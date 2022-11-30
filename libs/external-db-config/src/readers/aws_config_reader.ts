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
    const { host, username, password, DB, EXTERNAL_DATABASE_ID, ALLOWED_METASITES, DB_PORT } = config
    return { host: host, user: username, password: password, db: DB, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES, port: DB_PORT }
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
    const { host, username, password, DB, EXTERNAL_DATABASE_ID, ALLOWED_METASITES, HOST, PASSWORD, USER, DB_PORT }: {[key: string]: string} = { ...process.env, ...externalConfig }
    const config = {  host: host || HOST, username: username || USER, password: password || PASSWORD, DB, EXTERNAL_DATABASE_ID, ALLOWED_METASITES, DB_PORT }
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
        return { region: this.region, externalDatabaseId: config.EXTERNAL_DATABASE_ID, endpoint: process.env['ENDPOINT_URL'] }
      }
      return { region: this.region, externalDatabaseId: config.EXTERNAL_DATABASE_ID, allowedMetasites: config.ALLOWED_METASITES }
    }
    
    async readExternalAndLocalConfig() { 
      const { externalConfig, secretMangerError }: {[key: string]: any} = await this.readExternalConfig()
      const { EXTERNAL_DATABASE_ID = undefined, ALLOWED_METASITES = undefined } = { ...process.env, ...externalConfig }
      const config = { EXTERNAL_DATABASE_ID, ALLOWED_METASITES }

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
    const { EXTERNAL_DATABASE_ID, ALLOWED_METASITES, URI }: {EXTERNAL_DATABASE_ID: string, ALLOWED_METASITES: string, URI: string} = { ...process.env, ...externalConfig }
    const config = { EXTERNAL_DATABASE_ID, ALLOWED_METASITES, URI }

    return { config, secretMangerError: secretMangerError }
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()

    const { EXTERNAL_DATABASE_ID, ALLOWED_METASITES, URI } = config

    return { externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES, connectionUri: URI }
  }
}
