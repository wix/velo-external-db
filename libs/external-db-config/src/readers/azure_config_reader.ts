import { IConfigReader } from '../types'

export class AzureConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { HOST, USER, PASSWORD, DB, EXTERNAL_DATABASE_ID, ALLOWED_METASITES, UNSECURED_ENV, DB_PORT } = process.env
    return { host: HOST, user: USER, password: PASSWORD, db: DB, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES, unsecuredEnv: UNSECURED_ENV, port: DB_PORT }
  }
}
