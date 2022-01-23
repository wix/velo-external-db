const { checkRequiredKeys } = require('../utils/config_utils')

class GcpAuthConfigReader {
  constructor() {
  }

  async readConfig() {
    const { CALLBACKURL, CLIENTID, CLIENTSECRET } = process.env
    return { callbackurl: CALLBACKURL, clientid: CLIENTID, clientsecret: CLIENTSECRET }
  }

  validate() {
    return {
      missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CALLBACKURL', 'CLIENTID', 'CLIENTSECRET'])
    }
  }
}

module.exports = { GcpAuthConfigReader }
