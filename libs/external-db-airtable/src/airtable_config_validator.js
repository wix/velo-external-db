const { checkRequiredKeys } = require('velo-external-db-commons')

class AirtableConfigValidator {
    constructor(config) {
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
          missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['AIRTABLE_API_KEY', 'META_API_KEY', 'BASE_ID'])
        }
    }
}

module.exports = { AirtableConfigValidator }