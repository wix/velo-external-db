import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { IConfigReader } from '../types'
import { isJson, jsonParser } from '../utils/config_utils'
const emptyExternalDbConfig = (err: any) => ({ externalConfig: {}, secretMangerError: err.message })

export default class AwsAuthorizationConfigReader implements IConfigReader {
  secretId: string
  region: string | undefined
  constructor(region: string | undefined, secretId: string) {
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
      return { externalConfig: JSON.parse(data.SecretString || '') }
    } catch (err) {
      return emptyExternalDbConfig(err)
    }
  }

  async readExternalAndLocalConfig() {
    const { externalConfig, secretMangerError }: {[key:string]: any} = await this.readExternalConfig()
    const { PERMISSIONS }: { PERMISSIONS: any } = { ...process.env, ...externalConfig }
    const config = { PERMISSIONS }
    return { config, secretMangerError }
  }
}
