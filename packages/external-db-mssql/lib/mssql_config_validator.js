const { checkRequiredKeys } = require('velo-external-db-commons')

class MSSQLConfigValidator {
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

module.exports = { MSSQLConfigValidator }