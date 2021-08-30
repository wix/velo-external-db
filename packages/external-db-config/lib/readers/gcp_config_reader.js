const { checkRequiredKeys } = require('../utils/secret_provider_utils')

class GcpConfigReader {
  constructor () {
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
  constructor () {
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

module.exports = { GcpConfigReader, GcpSpannerConfigReader }
