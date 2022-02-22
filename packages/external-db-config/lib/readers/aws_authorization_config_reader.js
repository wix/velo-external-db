const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys, isJson, EmptyRoleConfig, configPattern, collectionConfigPattern } = require('../utils/config_utils')
const Avj = require('ajv')
const ajv = new Avj()
const EmptyAWSAuthConfig = { roleConfig: EmptyRoleConfig }

class AwsAuthorizationConfigReader {
  constructor(region, secretId) {
    this.configValidator = ajv.compile(configPattern)
    this.collectionValidator = ajv.compile(collectionConfigPattern)
    this.secretId = secretId
    this.region = region
  }

  async readConfig() {
    const { roleConfig: roleConfig } = await this.readExternalConfig()
                          .catch(() => EmptyAWSAuthConfig)
    
    const { collectionLevelConfig } = isJson(roleConfig) ? JSON.parse(roleConfig) : EmptyRoleConfig
    
    return collectionLevelConfig.filter(collection => this.collectionValidator(collection))
  }

  async readExternalConfig() {  
    const client = new SecretsManagerClient({ region: this.region })
    const data = await client.send(new GetSecretValueCommand({ SecretId: this.secretId }))
    return JSON.parse(data.SecretString)
  }

  async validate() {
    try{
        const { roleConfig: roleConfig } = await this.readExternalConfig()

        const valid = isJson(roleConfig) && this.configValidator(JSON.parse(roleConfig))

        let message 
        
    
        if (checkRequiredKeys(process.env, ['roleConfig']).length)  
          message = 'Role config is not defined, using default'
        else if (!isJson(roleConfig)) 
          message = 'Role config is not valid JSON'
        else if (!valid)
          message = this.configValidator.errors.map(err => (`Error in ${err.instancePath}: ${err.message}`)).join(', ')
        else 
          message = 'Authorization Config read successfully'
      
        return { valid, message }
    }

    catch(err) {
      console.log(err)
        return { valid: false, message: err.message }
    }
  }
}

module.exports = AwsAuthorizationConfigReader 
