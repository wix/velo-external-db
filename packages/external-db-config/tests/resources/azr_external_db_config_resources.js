const { gen } = require('test-commons')
const { lowercaseObjectKeys } = require('./test_commons')

const createDriver = () => {
  const driver = {
    stubSecret: (secret) => process.env = Object.assign(process.env, secret),
    stubBrokenSecret: (secret) => {
      const { deletedKey, newObject: brokenSecret } = gen.deleteRandomKeyObject(secret)
      process.env = Object.assign(process.env, brokenSecret)
      return { deletedKey, brokenSecret }
    },
    stubSecretWithEmptyField: (secret) => {
      const { clearedKey, newObject: brokenSecret } = gen.clearRandomKeyObject(secret)
      process.env = Object.assign(process.env, brokenSecret)
      return { clearedKey, brokenSecret }
    },
    restore: () => {
      delete process.env.HOST
      delete process.env.USER
      delete process.env.PASSWORD
      delete process.env.CLOUD_SQL_CONNECTION_NAME
      delete process.env.DB
      delete process.env.SECRET_KEY
    }
  }
  return driver
}

const testHelper = {
  serviceFormat: (secret) => secret,
  externalDBClientFormat: (secret) => {
    const formattedSecret = lowercaseObjectKeys(secret)
    formattedSecret.secretKey = formattedSecret.secret_key
    delete formattedSecret.secret_key
    return formattedSecret
  }
}

module.exports = { createDriver, testHelper }
