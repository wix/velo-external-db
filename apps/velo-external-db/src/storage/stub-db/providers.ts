import { checkRequiredKeys } from '@wix-velo/velo-external-db-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
const { UnsupportedDatabase } = errors

export class StubDataProvider {}

export class StubConfigValidator {
    config: any
    constructor(config: any) {
        this.config = config
    }

    readConfig() {
        return this.config
    }

    validate() {
        return {
          missingRequiredSecretsKeys: checkRequiredKeys(this.config, [])
        }
    }
}

export class StubDatabaseOperations {
    type: any
    constructor(type: any) {
        this.type = type
    }

    validateConnection() {
        return { valid: false, error: new UnsupportedDatabase(`Unknown db type: ${this.type}`) }
    }
}

export class StubSchemaProvider {
    constructor() {
    }

    list() {
        return {}
    }
}
