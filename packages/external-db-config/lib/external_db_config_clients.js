const createEmptyConfig = () => ({
  host: undefined,
  user: undefined,
  password: undefined,
  db: undefined,
  cloudSqlConnectionName: undefined,
  secretKey: undefined
})
class ExternalDbConfigClient {
  constructor (vendor) {
    this.config = createEmptyConfig()
    this.missingRequiredSecretsKeys = []
    this.secretsProvider = vendor

    if (!vendor) {
      this.missingRequiredSecretsKeys = ['CLOUD_VENDOR']
    }
  }

  async readConfig () {
    if (!this.secretsProvider) {
      return this.config
    }

    this.config = await this.secretsProvider.getSecrets()
    this.missingRequiredSecretsKeys  = this.secretsProvider.validateSecrets(this.config)

    return this.config
  }
}

module.exports = { ExternalDbConfigClient }
