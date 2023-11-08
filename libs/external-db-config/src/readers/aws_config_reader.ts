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
    const { host, username, password, DB, ALLOWED_METASITES, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID } = config
    return { host, user: username, password, db: DB, allowedMetasites: ALLOWED_METASITES, port: DB_PORT, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
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
    const { host, username, password, DB, ALLOWED_METASITES, HOST, PASSWORD, USER, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID }: {[key: string]: string} = { ...process.env, ...externalConfig }
    const config = {  host: host || HOST, username: username || USER, password: password || PASSWORD, DB, ALLOWED_METASITES, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID }
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
      return { region: this.region, jwtPublicKey: config.JWT_PUBLIC_KEY, appDefId: config.APP_DEF_ID, allowedMetasites: config.ALLOWED_METASITES }
    }
    
    async readExternalAndLocalConfig() { 
      const { externalConfig, secretMangerError }: {[key: string]: any} = await this.readExternalConfig()
      const { ALLOWED_METASITES = undefined, JWT_PUBLIC_KEY = undefined, APP_DEF_ID = undefined } = { ...process.env, ...externalConfig }
      const config = { JWT_PUBLIC_KEY, APP_DEF_ID, ALLOWED_METASITES }

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
    const { ALLOWED_METASITES, URI, JWT_PUBLIC_KEY, APP_DEF_ID }: { ALLOWED_METASITES: string, URI: string, JWT_PUBLIC_KEY: string, APP_DEF_ID: string } = { ...process.env, ...externalConfig }
    const config = { ALLOWED_METASITES, URI, JWT_PUBLIC_KEY, APP_DEF_ID }

    return { config, secretMangerError }
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()

    const { ALLOWED_METASITES, URI, JWT_PUBLIC_KEY, APP_DEF_ID } = config

    return { allowedMetasites: ALLOWED_METASITES, connectionUri: URI, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }
}
