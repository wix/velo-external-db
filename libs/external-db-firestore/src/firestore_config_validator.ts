import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'
import { IConfigValidator } from '@wix-velo/velo-external-db-types'

export class ConfigValidator implements IConfigValidator {
    requiredKeys: string[]
    config: any
    
    constructor(config: any) {
        this.requiredKeys = ['projectId'] 
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
