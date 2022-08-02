import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'

export default class ConfigValidator {
    config: any
    requiredKeys: string[]

    constructor(config: any) {
        this.config = config
        this.requiredKeys = ['projectId', 'databaseId']
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
