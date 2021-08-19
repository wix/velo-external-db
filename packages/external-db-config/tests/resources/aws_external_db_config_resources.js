
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
const mockClient = require('aws-sdk-client-mock')
const { gen } = require('test-commons')
const { lowercaseObjectKeys } = require('./test_commons')

const createDriver = () => {
  const mockedAwsSdk = mockClient.mockClient(SecretsManagerClient)
  const driver = {
    stubSecret: (secret) => mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(secret) }),
    stubBrokenSecret: (secret) => {
      const { deletedKey, newObject: newSecret } = gen.deleteRandomKeyObject(secret)
      mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(newSecret) })
      return { deletedKey, newSecret }
    },
    stubSecretWithEmptyField: (secret) => {
      const { clearedKey, newObject: newSecret } = gen.clearRandomKeyObject(secret)
      mockedAwsSdk.on(GetSecretValueCommand).resolves({ SecretString: JSON.stringify(newSecret) })
      return { clearedKey, newSecret: secret }
    },
    restore: () => {
      mockedAwsSdk.reset()
    }

  }
  return driver
}

const testHelper = () => {
  return {
    serviceFormat: (secret) => {
      secret.host = secret.HOST
      secret.username = secret.USER
      secret.password = secret.PASSWORD

      delete secret.HOST
      delete secret.USER
      delete secret.PASSWORD

      return secret
    },
    secretClientFormat: (secret) => {
      const formattedSecret = lowercaseObjectKeys(secret)
      formattedSecret.secretKey = formattedSecret.secret_key
      formattedSecret.user = formattedSecret.username
      delete formattedSecret.secret_key
      delete formattedSecret.username
      return formattedSecret
    }
  }
}

module.exports = { createDriver, testHelper }
