const { checkRequiredKeys } = require('@wix-velo/velo-external-db-commons')

class MongoConfigValidator {
    constructor(config) {
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['connectionUri'])
        }
    }
}

module.exports = { MongoConfigValidator }