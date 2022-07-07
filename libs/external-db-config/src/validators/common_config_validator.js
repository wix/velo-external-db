const { checkRequiredKeys, supportedDBs, supportedVendors } = require('../utils/config_utils')

class CommonConfigValidator {
    constructor(config, extended) {
        this.config = config
        this.extended = extended ?? false
    }

    readConfig() {
        return this.config
    }

    validate() {
        return this.extended ? this.validateExtended() : this.validateBasic()
    }

    validateBasic() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(this.config, ['secretKey']),
            validType: true,
            validVendor: true
        }
    }

    validateExtended() {
        const validType = supportedDBs.includes(this.config.type)
        const validVendor = supportedVendors.includes(this.config.vendor)
        return {
            validType,
            validVendor,
            missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLOUD_VENDOR', 'TYPE'])
        }
    }
}

module.exports = { CommonConfigValidator }