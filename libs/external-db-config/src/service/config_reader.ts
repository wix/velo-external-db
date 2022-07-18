import CommonConfigReader from "../readers/common_config_reader"
import { IAuthorizationConfigReader, IConfigReader } from "../types"

export default class ConfigReader {
  externalConfigReader: IConfigReader
  commonConfigReader: CommonConfigReader
  authorizationConfig: IAuthorizationConfigReader
  constructor(externalConfigReader: IConfigReader, commonConfigReader: CommonConfigReader, authorizationConfigReader: IAuthorizationConfigReader) {
    this.externalConfigReader = externalConfigReader
    this.commonConfigReader = commonConfigReader
    this.authorizationConfig = authorizationConfigReader
  }

  async readConfig() {
    const externalConfig = await this.externalConfigReader.readConfig()
    const authorizationConfig = await this.authorizationConfig.readConfig()
    return { ...externalConfig, authorization: authorizationConfig }
  }
}
