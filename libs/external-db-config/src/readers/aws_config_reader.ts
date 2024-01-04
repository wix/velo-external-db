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
    const { host, username, password, DB, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID } = config
    return { host, user: username, password, db: DB, port: DB_PORT, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
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
    const { host, username, password, DB, HOST, PASSWORD, USER, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID }: {[key: string]: string} = { ...process.env, ...externalConfig }
    const config = {  host: host || HOST, username: username || USER, password: password || PASSWORD, DB, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID }
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
        return { region: this.region, endpoint: process.env['ENDPOINT_URL'], jwtPublicKey: config.JWT_PUBLIC_KEY, appDefId: config.APP_DEF_ID }
      }
      return { region: this.region, jwtPublicKey: config.JWT_PUBLIC_KEY, appDefId: config.APP_DEF_ID }
    }
    
    async readExternalAndLocalConfig() { 
      const { externalConfig, secretMangerError }: {[key: string]: any} = await this.readExternalConfig()
      const { JWT_PUBLIC_KEY = undefined, APP_DEF_ID = undefined } = { ...process.env, ...externalConfig }
      const config = { JWT_PUBLIC_KEY, APP_DEF_ID }

      return { config, secretMangerError }
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
    const { URI, JWT_PUBLIC_KEY, APP_DEF_ID }: { URI: string, JWT_PUBLIC_KEY: string, APP_DEF_ID: string } = { ...process.env, ...externalConfig }
    const config = { URI, JWT_PUBLIC_KEY, APP_DEF_ID }

    return { config, secretMangerError }
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()

    const { URI, JWT_PUBLIC_KEY, APP_DEF_ID } = config

    return { connectionUri: URI, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }
}
