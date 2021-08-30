const {checkRequiredKeys} = require("./providers/secret_provider_utils");

class CommonConfigReader {
    constructor() { }

    getSecrets() {
        const { CLOUD_VENDOR, TYPE } = process.env
        return { vendor: CLOUD_VENDOR , type: TYPE }
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLOUD_VENDOR', 'TYPE'])
        }
    }
}

module.exports = CommonConfigReader