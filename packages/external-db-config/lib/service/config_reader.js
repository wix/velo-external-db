class ConfigReader {
  constructor(externalConfigReader, commonConfigReader, authorizationConfigReader) {
    this.externalConfigReader = externalConfigReader
    this.commonConfigReader = commonConfigReader
    this.authorizationConfig = authorizationConfigReader
  }

  async readConfig() {
    const externalConfig = await this.externalConfigReader.readConfig()
    const authorizationConfig =await this.authorizationConfig.readConfig()
    return { ...externalConfig, authorization: authorizationConfig }
  }

  async configStatus() {
    const { missingRequiredSecretsKeys } = await this.externalConfigReader.validate()
    const { missingRequiredSecretsKeys: missingRequiredEnvs, validType, validVendor } = this.commonConfigReader.validate()  
    const { valid: validAuthorization, message: authorizationMessage  } = this.authorizationConfig.validate()

    const validConfig = missingRequiredSecretsKeys.length === 0 && missingRequiredEnvs.length === 0 && validType && validVendor
    
  
    let message 
    if (missingRequiredSecretsKeys.length || missingRequiredEnvs.length )
      message = `Missing props: ${[...missingRequiredSecretsKeys, ...missingRequiredEnvs].join(', ')}`
    
    else if (!validVendor)
        message = 'Cloud type is not supported'
    
    else if(!validType)
        message = 'DB type is not supported'

    else 
      message = 'External DB Config read successfully'

    return { validConfig, message, validAuthorization, authorizationMessage }
  
  }
}

module.exports = ConfigReader
