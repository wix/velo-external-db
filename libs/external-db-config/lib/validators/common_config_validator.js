const { checkRequiredKeys } = require('../utils/config_utils')

class CommonConfigValidator {
    constructor(config) {
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['secretKey'])
        }
    }
}

module.exports = { CommonConfigValidator }