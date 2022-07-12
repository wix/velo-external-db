import { IConfigValidator } from '@wix-velo/velo-external-db-types'
import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'

export class AirtableConfigValidator implements IConfigValidator {
    config: any
    constructor(config: any) {
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
