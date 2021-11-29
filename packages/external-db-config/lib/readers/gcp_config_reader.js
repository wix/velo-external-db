const { checkRequiredKeys } = require('../utils/config_utils')

class GcpConfigReader {
  constructor() {
  }

  async readConfig() {
    const { CLOUD_SQL_CONNECTION_NAME, USER, PASSWORD, DB, SECRET_KEY } = process.env
    return { cloudSqlConnectionName: CLOUD_SQL_CONNECTION_NAME, user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLOUD_SQL_CONNECTION_NAME', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY'])
    }
  }
}

class GcpSpannerConfigReader {
  constructor() {
  }

  async readConfig() {
    const { PROJECT_ID, INSTANCE_ID, DATABASE_ID, SECRET_KEY } = process.env
    return { projectId: PROJECT_ID, instanceId: INSTANCE_ID, databaseId: DATABASE_ID, secretKey: SECRET_KEY }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['PROJECT_ID', 'INSTANCE_ID', 'DATABASE_ID', 'SECRET_KEY'])
    }
  }

}

class GcpFirestoreConfigReader {
  constructor() { }

  async readConfig() {
    const { PROJECT_ID, SECRET_KEY } = process.env
    return { projectId: PROJECT_ID, secretKey: SECRET_KEY }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['PROJECT_ID', 'SECRET_KEY'])
    }
  }

}

class GcpGoogleSheetsConfigReader {
  constructor() { }

  async readConfig() {
    const { CLIENT_EMAIL, SHEET_ID, API_PRIVATE_KEY, SECRET_KEY } = process.env
    return { clientEmail: CLIENT_EMAIL, apiPrivateKey: API_PRIVATE_KEY, sheetId: SHEET_ID, secretKey: SECRET_KEY }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLIENT_EMAIL', 'SHEET_ID', 'API_PRIVATE_KEY', 'SECRET_KEY'])
    }
  }
}

class GcpMongoConfigReader {
  constructor() { }

  async readConfig() {
    const { URI, SECRET_KEY } = process.env
    return { connectionUri: URI, secretKey: SECRET_KEY }
  }
  
  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['URI', 'SECRET_KEY'])
    }
  }
}

class GcpAirtableConfigReader {
  constructor() { }

  async readConfig() {
    const { AIRTABLE_API_KEY, META_API_KEY, BASE_ID, SECRET_KEY, BASE_URL } = process.env
    return { apiPrivateKey: AIRTABLE_API_KEY, metaApiKey: META_API_KEY, baseId: BASE_ID, secretKey: SECRET_KEY, baseUrl: BASE_URL }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['AIRTABLE_API_KEY', 'META_API_KEY', 'BASE_ID', 'SECRET_KEY'])
    }
  }
}

class GcpBigQueryConfigReader {
  constructor() {
  }

  async readConfig() {
    const { DATABASE_ID, SECRET_KEY } = process.env
    return { databaseId: DATABASE_ID, secretKey: SECRET_KEY }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['DATABASE_ID', 'SECRET_KEY'])
    }
  }

}


module.exports = { GcpConfigReader, GcpSpannerConfigReader, GcpFirestoreConfigReader, GcpGoogleSheetsConfigReader, GcpMongoConfigReader, GcpAirtableConfigReader, GcpBigQueryConfigReader }
