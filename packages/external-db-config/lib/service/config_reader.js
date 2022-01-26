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
    const { missingRequiredSecretsKeys: missing, validType, validVendor } = this.commonConfigReader.validate()

    if (missingRequiredSecretsKeys.length > 0 || (missing && missing.length > 0) || missingRequiredAuthSecretsKeys.length > 0) 
      return { message: `Missing props: ${[...missingRequiredSecretsKeys, ...missingRequiredAuthSecretsKeys, ...missing].join(', ')}`, valid: false }
        
    else if (!validVendor) 
      return { message: 'Cloud type is not supported', valid: false }       

    else if(!validType)
      return { message: 'DB type is not supported', valid: false }
   

    return { message: 'External DB Config read successfully', valid: true }
  }
}

module.exports = ConfigReader
