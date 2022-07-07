class ConfigReader {
  constructor(externalConfigReader, commonConfigReader, authorizationConfigReader) {
    this.externalConfigReader = externalConfigReader
    this.commonConfigReader = commonConfigReader
    this.authorizationConfig = authorizationConfigReader
  }

  async readConfig() {
    const externalConfig = await this.externalConfigReader.readConfig()
    const authorizationConfig =await this.authorizationConfig.readConfig()
    return { ...externalConfig, authorization: authorizationConfig }
  }
}

module.exports = ConfigReader
