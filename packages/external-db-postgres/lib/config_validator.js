const { checkRequiredKeys } = require('../../velo-external-db-core/node_modules/external-db-config/lib/utils/config_utils')

class PostgresConfigValidator {
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

module.exports = { PostgresConfigValidator }