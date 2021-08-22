const createEmptyConfig = () => ({
  host: undefined,
  user: undefined,
  password: undefined,
  db: undefined,
  cloudSqlConnectionName: undefined,
  secretKey: undefined
})
class ExternalDbConfigClient {
  constructor (secretProvider) {
    this.config = createEmptyConfig()
    this.missingRequiredSecretsKeys = []
    this.secretsProvider = secretProvider

    if (!secretProvider) {
      this.missingRequiredSecretsKeys = ['CLOUD_VENDOR']
    }
  }

  async readConfig () {
    if (!this.secretsProvider) {
      return this.config
    }

    this.config = await this.secretsProvider.getSecrets()
    this.missingRequiredSecretsKeys = this.secretsProvider.validateSecrets()

    return this.config
  }
}

module.exports = { ExternalDbConfigClient }
