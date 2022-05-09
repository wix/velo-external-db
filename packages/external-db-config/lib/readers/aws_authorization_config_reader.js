const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys, isJson, configPattern, collectionConfigPattern, jsonParser } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj({ strict: false })
const emptyExternalDbConfig = (err) => ({ externalConfig: {}, secretMangerError: err.message })

class AwsAuthorizationConfigReader {
  constructor(region, secretId) {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { config } = await this.readExternalAndLocalConfig()
    const { ROLE_CONFIG: roleConfig } = config

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
    const { ROLE_CONFIG } = { ...process.env, ...externalConfig }
    const config = { ROLE_CONFIG }
    return { config, secretMangerError: secretMangerError }
  }

  async validate() {
    try{
        const { config, secretMangerError } = await this.readExternalAndLocalConfig()

        const { ROLE_CONFIG: roleConfig } = config

        const valid = isJson(roleConfig) && this.configValidator(jsonParser(roleConfig))

        let message 
        
    
        if (checkRequiredKeys(config, ['ROLE_CONFIG']).length)  
          message = 'Role config is not defined, using default'
        else if (!isJson(roleConfig)) 
          message = 'Role config is not valid JSON'
        else if (!valid)
          message = this.configValidator.errors.map(err => (`Error in ${err.instancePath}: ${err.message}`)).join(', ')
        else 
          message = 'Authorization Config read successfully'
      
        return { valid, message, secretMangerError }
    }

    catch(err) {
      console.log(err)
        return { valid: false, message: err.message }
    }
  }
}

module.exports = AwsAuthorizationConfigReader 
