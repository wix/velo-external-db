const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys, isJson, EmptyRoleConfig, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj({ strict: false })
const emptyConfig = (err) => ({ secretMangerError: err.message })

class AwsAuthorizationConfigReader {
  constructor(region, secretId) {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { config } = await this.getExternalAndLocalEnvs()
    const { ROLE_CONFIG: roleConfig } = config

    const { collectionLevelConfig } = isJson(roleConfig) ? JSON.parse(roleConfig) : EmptyRoleConfig
    
    return collectionLevelConfig.filter(collection => this.collectionValidator(collection))
  }

  async readExternalConfig() {  
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async getExternalAndLocalEnvs() {
    const externalConfig = await this.readExternalConfig().catch(emptyConfig)
    const { ROLE_CONFIG } = { ...process.env, ...externalConfig }
    const config = { ROLE_CONFIG }
    return { config, secretMangerError: externalConfig.secretMangerError }
  }

  async validate() {
    try{
        const { config, secretMangerError } = await this.getExternalAndLocalEnvs()

        const { ROLE_CONFIG: roleConfig } = config

        const valid = isJson(roleConfig) && this.configValidator(JSON.parse(roleConfig))

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
