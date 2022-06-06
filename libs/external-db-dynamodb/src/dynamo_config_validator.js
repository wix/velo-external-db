const { checkRequiredKeys } = require('@wix-velo/velo-external-db-commons')

class ConfigValidator {
    constructor(config) {
        this.config = config
        this.requiredKeys = ['region']
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
          missingRequiredSecretsKeys: checkRequiredKeys(this.config, this.requiredKeys)
        }
    }
}

module.exports = ConfigValidator