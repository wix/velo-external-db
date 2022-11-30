import { IConfigReader } from '../types'

export class GcpConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { CLOUD_SQL_CONNECTION_NAME, USER, PASSWORD, DB, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
    return { cloudSqlConnectionName: CLOUD_SQL_CONNECTION_NAME, user: USER, password: PASSWORD, db: DB, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
  }

}

export class GcpSpannerConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, INSTANCE_ID, DATABASE_ID, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
    return { projectId: PROJECT_ID, instanceId: INSTANCE_ID, databaseId: DATABASE_ID, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
  }


}

export class GcpFirestoreConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { PROJECT_ID, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
    return { projectId: PROJECT_ID, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
  }


}

export class GcpGoogleSheetsConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { CLIENT_EMAIL, SHEET_ID, API_PRIVATE_KEY, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
    return { clientEmail: CLIENT_EMAIL, apiPrivateKey: API_PRIVATE_KEY, sheetId: SHEET_ID, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
  }

}

export class GcpMongoConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { URI, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
    return { connectionUri: URI, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
  }
}

export class GcpAirtableConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { AIRTABLE_API_KEY, META_API_KEY, BASE_ID, EXTERNAL_DATABASE_ID, ALLOWED_METASITES, BASE_URL } = process.env
    return { apiPrivateKey: AIRTABLE_API_KEY, metaApiKey: META_API_KEY, baseId: BASE_ID, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES, baseUrl: BASE_URL }
  }
}

export class GcpBigQueryConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, DATABASE_ID, EXTERNAL_DATABASE_ID, ALLOWED_METASITES } = process.env
    return { projectId: PROJECT_ID, databaseId: DATABASE_ID, externalDatabaseId: EXTERNAL_DATABASE_ID, allowedMetasites: ALLOWED_METASITES }
  }
}
