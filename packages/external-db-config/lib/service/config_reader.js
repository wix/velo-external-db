class ConfigReader {
  constructor(externalConfigReader, commonConfigReader, externalAuthConfigReader) {
    this.externalConfigReader = externalConfigReader
    this.externalAuthConfigReader = externalAuthConfigReader
    this.commonConfigReader = commonConfigReader
  }

  async readConfig() {
    const externalConfig = await this.externalConfigReader.readConfig()
    const authConfig = await this.externalAuthConfigReader.readConfig()

    return { ...externalConfig, auth: authConfig }
  }

  async configStatus() {
    const { missingRequiredSecretsKeys } = await this.externalConfigReader.validate()
    const { missingRequiredSecretsKeys: missingRequiredAuthSecretsKeys } = await this.externalAuthConfigReader.validate()
    const { missingRequiredSecretsKeys: missingRequiredEnvs, validType, validVendor } = this.commonConfigReader.validate()

    const validConfig = missingRequiredSecretsKeys.length === 0 && missingRequiredEnvs.length === 0 && validType && validVendor
    const validAuthConfig = missingRequiredAuthSecretsKeys.length === 0
    
  
    let message 
    if (!validAuthConfig) 
      message = `Missing props: ${missingRequiredAuthSecretsKeys.join(', ')}`      
    
    else if (missingRequiredSecretsKeys.length > 0 || missingRequiredEnvs.length > 0)
      message = `Missing props: ${[...missingRequiredSecretsKeys, ...missingRequiredEnvs].join(', ')}`
    
    else if (!validVendor)
        message = 'Cloud type is not supported'
    
    else if(!validType)
        message = 'DB type is not supported'

    else 
      message = 'External DB Config read successfully'

    return { validAuthConfig, validConfig, message }
  
  }
}

module.exports = ConfigReader
