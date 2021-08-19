
class SecretsProvider {
  constructor () {
    this.requiredSecretsKeys = ['host', 'user', 'password', 'db', 'secretKey']
  }

  async getSecrets () {
    const { HOST : host, USER: user, PASSWORD: password, DB: db, SECRET_KEY: secretKey } = process.env
    return { host, user, password, db, secretKey }
  }

  validateSecrets (secrets) {
    const missingRequiredProps = this.requiredSecretsKeys.reduce((missingRequiredProps, currentRequiredProps) => {
      if (!secrets.hasOwnProperty(currentRequiredProps) || secrets[currentRequiredProps] === undefined) {
        return [...missingRequiredProps, currentRequiredProps]
      } else {
        return missingRequiredProps
      }
    }, [])

    return missingRequiredProps
  }
}

module.exports = { SecretsProvider }
