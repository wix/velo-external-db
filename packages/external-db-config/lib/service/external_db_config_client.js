class ExternalDbConfigClient {
  constructor (secretProvider, commonConfigReader) {
    this.secretsProvider = secretProvider
    this.commonConfigReader = commonConfigReader
  }

  async readConfig() {
    return await this.secretsProvider.getSecrets()
  }

  async configStatus() {
    const { missingRequiredSecretsKeys } = await this.secretsProvider.validate()
    const { missingRequiredSecretsKeys : missing } = this.commonConfigReader.validate()

    if (missingRequiredSecretsKeys.length > 0 || (missing && missing.length > 0)) {
      return `Missing props: ${[...missingRequiredSecretsKeys, missing].join(', ')}`
    }
    return 'External DB Config read successfully'
  }


}

module.exports = ExternalDbConfigClient
