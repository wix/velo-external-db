const { checkRequiredKeys, checkThatHasAtLestOneRequiredKeys } = require('velo-external-db-commons')
class PostgresConfigValidator {
    constructor(config) {
        this.requiredKeys = ['user', 'password', 'db'] 
        this.hostKeyOptions = ['host', 'cloudSqlConnectionName']
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        const missingRequiredKeys = checkRequiredKeys(this.config, this.requiredKeys) 
        const missingRequiredHostKey = checkThatHasAtLestOneRequiredKeys(this.config, this.hostKeyOptions)
        return {
          missingRequiredSecretsKeys: [...missingRequiredKeys, ...missingRequiredHostKey ]
        }
    }
}

module.exports = { PostgresConfigValidator }