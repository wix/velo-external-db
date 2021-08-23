const createEmptyConfig = () => ({
  host: null,
  user: null,
  password: null,
  db: null,
  cloudSqlConnectionName: null,
  secretKey: null
})
class ExternalDbConfigClient {
  constructor (secretProvider) {
    this.config = createEmptyConfig()
    this.missingRequiredSecretsKeys = []
    this.secretsProvider = secretProvider

    if (!secretProvider) {
      this.missingRequiredSecretsKeys.push('CLOUD_VENDOR')
    }
  }

  async readConfig () {
    if (!this.secretsProvider) {
      return this.config
    }

    this.config = await this.secretsProvider.getSecrets()
    this.missingRequiredSecretsKeys = this.secretsProvider.validateSecrets()

    if(!process.env.TYPE){
      this.missingRequiredSecretsKeys.push('TYPE')
    }

    return this.config
  }

  getConfig() {
    const config = Object.assign({}, this.config)
    if (config.password) config.password = '*********'
    if (config.secretKey) config.secretKey = '*********'
    return config
  }
}

module.exports = { ExternalDbConfigClient }
