const { checkRequiredKeys } = require('../utils/config_utils')

class CommonConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE, SECRET_ID_OVERRIDE } = process.env
        return { vendor: CLOUD_VENDOR, type: TYPE, secretId: SECRET_ID_OVERRIDE }
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLOUD_VENDOR', 'TYPE'])
        }
    }
}

module.exports = CommonConfigReader