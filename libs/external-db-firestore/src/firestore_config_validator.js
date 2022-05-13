const { checkRequiredKeys } = require('velo-external-db-commons')

class ConfigValidator {
    constructor(config) {
        this.requiredKeys = ['projectId', 'instanceId', 'databaseId'] 
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