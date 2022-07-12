import { IConfigReader } from '../types'
import { isJson, jsonParser } from '../utils/config_utils'

export default class AuthorizationConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PERMISSIONS: roleConfig } = process.env

    return isJson(roleConfig) ? jsonParser((roleConfig) as string) : roleConfig
  }
}
