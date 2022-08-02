import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'
import { IConfigValidator } from '@wix-velo/velo-external-db-types'

export default class ConfigValidator implements IConfigValidator {
    config: any
    requiredKeys: string[]
    constructor(config: any) {
        this.config = config
        this.requiredKeys = ['region']
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
