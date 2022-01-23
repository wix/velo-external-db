const { checkRequiredKeys } = require('../utils/config_utils')

class CommonConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE, REGION, SECRET_NAME } = process.env
        return { vendor: CLOUD_VENDOR, type: TYPE, region: REGION, secretId: SECRET_NAME }
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLOUD_VENDOR', 'TYPE'])
        }
    }
}

module.exports = CommonConfigReader