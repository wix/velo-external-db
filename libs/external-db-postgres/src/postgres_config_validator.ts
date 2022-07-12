import { IConfigValidator } from '@wix-velo/velo-external-db-types'
import { checkRequiredKeys, checkThatHasAtLestOneRequiredKeys } from '@wix-velo/velo-external-db-commons'


export class PostgresConfigValidator implements IConfigValidator {
    requiredKeys: string[]
    hostKeyOptions: string[]
    config: any
    
    public constructor(config: any) {
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
