class ConfigValidator {
    constructor(connectorValidator, authValidator, commonValidator) {
        this.connectorValidator = connectorValidator
        this.authValidator = authValidator
        this.commonValidator = commonValidator
    }

    readConfig() { 
        return { ...this.connectorValidator.readConfig(), ...this.commonValidator.readConfig() }
    }

    configStatus() {
        const { missingRequiredSecretsKeys: missingRequiredConnectorEnvs } = this.connectorValidator.validate()
        const { valid: validAuthorization, message: authorizationMessage } = this.authValidator.validate()
        const { missingRequiredSecretsKeys: missingRequiredCommonEnvs } = this.commonValidator.validate()

        const validConfig = missingRequiredConnectorEnvs.length === 0 && missingRequiredCommonEnvs.length === 0

        let message
        
        if (missingRequiredConnectorEnvs.length || missingRequiredCommonEnvs.length) {
            console.log(missingRequiredConnectorEnvs)
            message = `Missing props: ${[...missingRequiredConnectorEnvs, ...missingRequiredCommonEnvs].join(', ')}`
        }
        else
            message = 'External DB Config read successfully'
        return { validConfig, message, validAuthorization, authorizationMessage }
    }
}

module.exports = { ConfigValidator }