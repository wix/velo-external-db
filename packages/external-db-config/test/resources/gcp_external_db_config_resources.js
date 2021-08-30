const { lowercaseObjectKeys } = require('./test_commons')

const secretMangerTestEnv = require('./azr_external_db_config_resources')

const createDriver = () => {
  const driver = secretMangerTestEnv.createDriver()

  return driver
}

const testHelper = {
  serviceFormat: (secret) => {
    secret.CLOUD_SQL_CONNECTION_NAME = secret.HOST
    delete secret.HOST
    return secret
  },

  externalDBClientFormat: (secret) => {
    const formattedSecret = lowercaseObjectKeys(secret)
    formattedSecret.cloudSqlConnectionName = formattedSecret.cloud_sql_connection_name
    delete formattedSecret.cloud_sql_connection_name
    formattedSecret.secretKey = formattedSecret.secret_key
    delete formattedSecret.secret_key
    return formattedSecret
  }
}

module.exports = { createDriver, testHelper }
