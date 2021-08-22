

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
    host:undefined,
    user: undefined,
    password: undefined,
    db: undefined,
    secretKey: undefined,
    }
  }
}

module.exports = { createDriver, testHelper }
