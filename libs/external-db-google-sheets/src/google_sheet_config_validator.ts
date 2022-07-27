import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'
import { IConfigValidator } from '@wix-velo/velo-external-db-types'

export default class ConfigValidator implements IConfigValidator {
    requiredKeys: string[]
    config: any

    constructor(config: any) {
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
