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
    const { missingRequiredSecretsKeys: missingRequiredEnvs, validType, validVendor } = this.commonConfigReader.validate()

    return {
      missingRequiredSecretsKeys,
      missingRequiredEnvs,
      validType,
      validVendor,
    }


  }
}

module.exports = ConfigReader
