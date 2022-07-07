class AzureConfigReader {
  constructor() {
  }

  async readConfig() {
    const { HOST, USER, PASSWORD, DB, SECRET_KEY, UNSECURED_ENV } = process.env
    return { host: HOST, user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY, unsecuredEnv: UNSECURED_ENV }
  }
}

module.exports = { AzureConfigReader }
