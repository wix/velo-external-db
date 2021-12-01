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
    const { missingRequiredSecretsKeys: missing } = this.commonConfigReader.validate()

    if (missingRequiredSecretsKeys.length > 0 || (missing && missing.length > 0)) {
      return `Missing props: ${[...missingRequiredSecretsKeys, missing].join(', ')}`
    }
    return 'External DB Config read successfully'
  }
}

module.exports = ConfigReader
