class ConfigValidator {
    constructor(connectorValidator, authValidator, commonValidator) {
        this.connectorValidator = connectorValidator
        this.authValidator = authValidator
        this.commonValidator = commonValidator
    }

    readConfig() { 
        return { ...this.connectorValidator.readConfig(), ...this.commonValidator.readConfig(), authorization: this.authValidator.readConfig() }
    }

    configStatus() {
        const { missingRequiredSecretsKeys: missingRequiredConnectorEnvs } = this.connectorValidator.validate()
        const { valid: validAuthorization, message: authorizationMessage } = this.authValidator.validate()
        const { missingRequiredSecretsKeys: missingRequiredCommonEnvs, validType, validVendor } = this.commonValidator.validate()

        const validConfig = missingRequiredConnectorEnvs.length === 0 && missingRequiredCommonEnvs.length === 0

        let message
        
        if (missingRequiredConnectorEnvs.length || missingRequiredCommonEnvs.length) {
            message = `Missing props: ${[...missingRequiredConnectorEnvs, ...missingRequiredCommonEnvs].join(', ')}`
        }

        else if (!validVendor)
            message = 'Cloud type is not supported'

        else if(!validType)
            message = 'DB type is not supported'

        else
            message = 'External DB Config read successfully'
        return { validConfig, message, validAuthorization, authorizationMessage }
    }
}

module.exports = { ConfigValidator }