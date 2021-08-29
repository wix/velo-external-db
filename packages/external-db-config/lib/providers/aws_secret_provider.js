const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const { checkRequiredKeys } = require('./secret_provider_utils')

class AwsSecretProvider {
  constructor (region) {
    this.secret = {}
    this.requiredSecretsKeys = ['host', 'username', 'password', 'DB', 'SECRET_KEY']
    this.secretId = 'VELO-EXTERNAL-DB-SECRETS'
    this.secretMangerClient = new SecretsManagerClient({ region })
  }

  async getSecrets () {
    const getSecretsCommand = new GetSecretValueCommand({ SecretId: this.secretId })

    try {
      const data = await this.secretMangerClient.send(getSecretsCommand)
      const secrets = JSON.parse(data.SecretString)
      const { host, username, password, DB, SECRET_KEY } = secrets
      this.secret = {host,username,password,DB,SECRET_KEY}
      return { host, user : username, password, db: DB, secretKey : SECRET_KEY }
    } 
    catch (err) {
      throw (err)
    }
  }

  validateSecrets = () => checkRequiredKeys (this.secret,this.requiredSecretsKeys)

}

module.exports = { AwsSecretProvider }
