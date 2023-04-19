import { IConfigReader } from '../types'

export class GcpConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { CLOUD_SQL_CONNECTION_NAME, USER, PASSWORD, DB, SECRET_KEY, DB_PORT } = process.env
    return { cloudSqlConnectionName: CLOUD_SQL_CONNECTION_NAME, user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY, port: DB_PORT }
  }

}

export class GcpSpannerConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, INSTANCE_ID, DATABASE_ID, SECRET_KEY } = process.env
    return { projectId: PROJECT_ID, instanceId: INSTANCE_ID, databaseId: DATABASE_ID, secretKey: SECRET_KEY }
  }


}

export class GcpFirestoreConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { PROJECT_ID, SECRET_KEY } = process.env
    return { projectId: PROJECT_ID, secretKey: SECRET_KEY }
  }


}

export class GcpGoogleSheetsConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { CLIENT_EMAIL, SHEET_ID, API_PRIVATE_KEY, SECRET_KEY, ENABLE_CACHE, STD_TTL, CHECK_PERIOD } = process.env
    return { clientEmail: CLIENT_EMAIL, apiPrivateKey: API_PRIVATE_KEY, sheetId: SHEET_ID, secretKey: SECRET_KEY, 
      enableCache: ENABLE_CACHE === 'true' ? true : false, stdTtl: STD_TTL, checkPeriod: CHECK_PERIOD }
  }

}

export class GcpMongoConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { URI, SECRET_KEY } = process.env
    return { connectionUri: URI, secretKey: SECRET_KEY }
  }
}

export class GcpAirtableConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { AIRTABLE_API_KEY, META_API_KEY, BASE_ID, SECRET_KEY, BASE_URL } = process.env
    return { apiPrivateKey: AIRTABLE_API_KEY, metaApiKey: META_API_KEY, baseId: BASE_ID, secretKey: SECRET_KEY, baseUrl: BASE_URL }
  }
}

export class GcpBigQueryConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, DATABASE_ID, SECRET_KEY } = process.env
    return { projectId: PROJECT_ID, databaseId: DATABASE_ID, secretKey: SECRET_KEY }
  }
}
