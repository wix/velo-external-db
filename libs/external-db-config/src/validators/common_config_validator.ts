import { ValidateConfigResponse } from '@wix-velo/velo-external-db-types'
import { checkRequiredKeys, supportedDBs, supportedVendors } from '../utils/config_utils'

export type CommonConfigResponseExtended = ValidateConfigResponse & {validType: boolean, validVendor: boolean}
 

export class CommonConfigValidator {
    config: any
    extended: boolean
    constructor(config: any, extended?: boolean) {
        this.config = config
        this.extended = extended ?? false
    }

    readConfig() {
        return this.config
    }

    validate(): ValidateConfigResponse | CommonConfigResponseExtended {
        return this.extended ? this.validateExtended() : this.validateBasic()
    }

    validateBasic() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['jwtPublicKey', 'appDefId'])
        }
    }

    validateExtended() {
        const validType = supportedDBs.includes(this.config.type)
        const validVendor = supportedVendors.includes(this.config.vendor)
        return {
            validType,
            validVendor,
            missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['type', 'vendor', 'jwtPublicKey', 'appDefId'])
        }
    }
}
