const { checkRequiredKeys } = require('@wix-velo/velo-external-db-commons')

class ConfigValidator {
    constructor(config) {
        this.requiredKeys = ['clientEmail', 'apiPrivateKey', 'databaseId'] 
        this.config = config
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
