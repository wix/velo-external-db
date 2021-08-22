const { Uninitialized } = require('test-commons')


const createDriver = () => {
  const driver = {
    stubSecret: (secret) => {},
    stubBrokenSecret: (secret) => {
      return { deletedKey : 'CLOUD_VENDOR', brokenSecret : {} }
    },
    stubSecretWithEmptyField: (secret) => {
      return { clearedKey :'CLOUD_VENDOR', brokenSecret : {}  }
    },
    restore: () => {}
  }
  return driver
}

const testHelper = {
  serviceFormat: (secret) => {},
  externalDBClientFormat: (secret) => {
    return {
    host:Uninitialized,
    user: Uninitialized,
    password: Uninitialized,
    db: Uninitialized,
    secretKey: Uninitialized,
    cloudSqlConnectionName: Uninitialized
    }
  }
}

module.exports = { createDriver, testHelper }
