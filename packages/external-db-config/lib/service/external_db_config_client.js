class ExternalDbConfigClient {
  constructor (configReader, commonConfigReader) {
    this.configReader = configReader
    this.commonConfigReader = commonConfigReader
  }

  async readConfig() {
    return await this.configReader.readConfig()
  }

  async configStatus() {
    const { missingRequiredSecretsKeys } = await this.configReader.validate()
    const { missingRequiredSecretsKeys : missing } = this.commonConfigReader.validate()

    if (missingRequiredSecretsKeys.length > 0 || (missing && missing.length > 0)) {
      return `Missing props: ${[...missingRequiredSecretsKeys, missing].join(', ')}`
    }
    return 'External DB Config read successfully'
  }


}

module.exports = ExternalDbConfigClient
