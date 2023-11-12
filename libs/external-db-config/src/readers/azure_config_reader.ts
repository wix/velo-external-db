import { IConfigReader } from '../types'

export class AzureConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { HOST, USER, PASSWORD, DB, ALLOWED_METASITES, UNSECURED_ENV, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { host: HOST, user: USER, password: PASSWORD, db: DB, allowedMetasites: ALLOWED_METASITES, 
             unsecuredEnv: UNSECURED_ENV, port: DB_PORT, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }
}
