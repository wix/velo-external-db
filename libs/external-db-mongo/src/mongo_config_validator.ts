import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'
import { IConfigValidator } from '@wix-velo/velo-external-db-types'

export class MongoConfigValidator implements IConfigValidator{
    config: any
    constructor(config: any) {
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['connectionUri'])
        }
    }
}
