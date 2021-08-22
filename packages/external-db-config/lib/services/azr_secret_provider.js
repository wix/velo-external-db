const { checkRequiredKeys } = require('./secret_provider_utils')

class AzrSecretsProvider {
  constructor () {
    this.secret = {}
    this.requiredSecretsKeys = ['HOST', 'USER', 'PASSWORD', 'DB', 'SECRET_KEY']
  }

  async getSecrets () {
    const { HOST, USER, PASSWORD, DB, SECRET_KEY } = process.env
    this.secret = {HOST,USER,PASSWORD,DB,SECRET_KEY}
    return { host: HOST , user: USER, password: PASSWORD, db: DB, secretKey: SECRET_KEY }
  }

  validateSecrets = () => checkRequiredKeys (this.secret,this.requiredSecretsKeys)
}

module.exports = { AzrSecretsProvider }
