import { checkRequiredKeys, checkThatHasAtLestOneRequiredKeys } from '@wix-velo/velo-external-db-commons'
import { IConfigValidator } from '@wix-velo/velo-external-db-types'

export class MySqlConfigValidator implements IConfigValidator {
    requiredKeys: string[]
    hostKeyOptions: string[]
    config: any
    constructor(config: any) {
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
