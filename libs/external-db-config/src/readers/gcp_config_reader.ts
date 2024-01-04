import { IConfigReader } from '../types'

export class GcpConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { CLOUD_SQL_CONNECTION_NAME, USER, PASSWORD, DB, DB_PORT, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { cloudSqlConnectionName: CLOUD_SQL_CONNECTION_NAME, user: USER, password: PASSWORD, db: DB,
             port: DB_PORT, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }

}

export class GcpSpannerConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, INSTANCE_ID, DATABASE_ID, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { projectId: PROJECT_ID, instanceId: INSTANCE_ID, databaseId: DATABASE_ID, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }


}

export class GcpFirestoreConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { PROJECT_ID, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { projectId: PROJECT_ID, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }


}

export class GcpGoogleSheetsConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { CLIENT_EMAIL, SHEET_ID, API_PRIVATE_KEY, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { clientEmail: CLIENT_EMAIL, apiPrivateKey: API_PRIVATE_KEY, sheetId: SHEET_ID,
             jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }

}

export class GcpMongoConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { URI, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { connectionUri: URI, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }
}

export class GcpAirtableConfigReader implements IConfigReader {
  constructor() { }

  async readConfig() {
    const { AIRTABLE_API_KEY, META_API_KEY, BASE_ID, BASE_URL, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { apiPrivateKey: AIRTABLE_API_KEY, metaApiKey: META_API_KEY, baseId: BASE_ID,
             baseUrl: BASE_URL, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }
}

export class GcpBigQueryConfigReader implements IConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, DATABASE_ID, JWT_PUBLIC_KEY, APP_DEF_ID } = process.env
    return { projectId: PROJECT_ID, databaseId: DATABASE_ID, jwtPublicKey: JWT_PUBLIC_KEY, appDefId: APP_DEF_ID }
  }
}
