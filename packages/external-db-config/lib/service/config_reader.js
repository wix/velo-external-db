class ConfigReader {
  constructor(externalConfigReader, commonConfigReader) {
    this.externalConfigReader = externalConfigReader
    this.commonConfigReader = commonConfigReader
  }

  async readConfig() {
    return await this.externalConfigReader.readConfig()
  }

  async configStatus() {
    const { missingRequiredSecretsKeys } = await this.externalConfigReader.validate()
    const { missingRequiredSecretsKeys: missing, validType, validVendor } = this.commonConfigReader.validate()

    if (missingRequiredSecretsKeys.length > 0 || (missing && missing.length > 0)) {
      return `Missing props: ${[...missingRequiredSecretsKeys, missing].join(', ')}`
    }
    
    else if (!validVendor) {
      return 'Cloud type is not supported'
    }

    else if(!validType) {
      return 'DB type is not supported'
    }


    return 'External DB Config read successfully'
  }
}

module.exports = ConfigReader
