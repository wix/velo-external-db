import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'

class MongoConfigValidator {
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

export { MongoConfigValidator }