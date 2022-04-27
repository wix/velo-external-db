const { checkRequiredKeys } = require('velo-external-db-commons')

class MySqlConfigValidator {
    constructor(config) {
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
          missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['host', 'user', 'password', 'db'])
        }
    }
}

module.exports = { MySqlConfigValidator }