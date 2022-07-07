import { isJson, jsonParser } from '../utils/config_utils'

export default class AuthorizationConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PERMISSIONS: roleConfig } = process.env

    return isJson(roleConfig) ? jsonParser(roleConfig) : roleConfig
  }
}
